import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

export async function POST(req: Request) {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
        console.error('❌ CRITICAL: STRIPE_WEBHOOK_SECRET is not defined in environment variables.');
        return NextResponse.json({ error: 'Configuration Error' }, { status: 500 });
    }

    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get('Stripe-Signature') as string;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
        console.log(`✅ Webhook received: ${event.type}`);
    } catch (err: any) {
        console.error(`❌ Webhook signature verification failed:`, err.message);
        return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    const session = event.data.object as any;

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                console.log('Processing checkout.session.completed...');
                const subscriptionId = session.subscription as string;
                if (!subscriptionId) {
                    console.log('No subscription ID found in session');
                    break;
                }

                const subscription = await stripe.subscriptions.retrieve(subscriptionId);
                const customerId = session.customer as string;

                // Priorizar client_reference_id (enviado desde n8n), luego phone de Stripe, luego metadata
                let rawPhone = session.client_reference_id || session.customer_details?.phone || session.metadata?.phone;

                if (!rawPhone) {
                    console.error('❌ CRITICAL: No phone number found for session. Ensure "Phone number collection" is enabled in Stripe Payment Link.');
                    console.log('Session Data:', JSON.stringify({
                        id: session.id,
                        customer_details: session.customer_details,
                        metadata: session.metadata
                    }));
                    break;
                }

                // Sincronizar con n8n: quitar el "+" si existe
                const phone = rawPhone.replace('+', '');

                console.log(`Saving subscriber for phone: ${phone}`);

                // Asegurarnos de que el periodo final sea una fecha válida
                const timestamp = (subscription as any).current_period_end;
                const periodEnd = timestamp ? new Date(timestamp * 1000) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 días por defecto si falta

                if (isNaN(periodEnd.getTime())) {
                    console.error('❌ Invalid periodEnd date detected:', timestamp);
                }

                await prisma.subscriber.upsert({
                    where: { phone },
                    update: {
                        stripeCustomerId: customerId,
                        stripeSubscriptionId: (subscription as any).id,
                        status: (subscription as any).status,
                        currentPeriodEnd: isNaN(periodEnd.getTime()) ? null : periodEnd,
                    },
                    create: {
                        phone,
                        stripeCustomerId: customerId,
                        stripeSubscriptionId: (subscription as any).id,
                        status: (subscription as any).status,
                        currentPeriodEnd: isNaN(periodEnd.getTime()) ? null : periodEnd,
                    },
                });
                console.log('✅ Subscriber saved successfully');
                break;
            }

            case 'customer.subscription.updated': {
                const subscription = event.data.object as any;
                console.log(`Updating subscription for: ${subscription.id}`);
                await prisma.subscriber.update({
                    where: { stripeSubscriptionId: subscription.id },
                    data: {
                        status: subscription.status,
                        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
                    },
                });
                break;
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object as any;
                console.log(`Canceling subscription: ${subscription.id}`);
                await prisma.subscriber.update({
                    where: { stripeSubscriptionId: subscription.id },
                    data: {
                        status: 'canceled',
                    },
                });
                break;
            }

            default:
                console.log(`Unhandled event type ${event.type}`);
        }
    } catch (dbError: any) {
        console.error('❌ Database error during webhook processing:', dbError);
        return NextResponse.json({ error: 'Database Error' }, { status: 500 });
    }

    return NextResponse.json({ received: true });
}
