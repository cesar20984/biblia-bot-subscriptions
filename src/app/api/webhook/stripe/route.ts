import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
    const body = await req.text();
    const signature = (await headers()).get('Stripe-Signature') as string;

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

                // Prioritize phone from customer_details, then metadata
                const phone = session.customer_details?.phone || session.metadata?.phone;

                if (!phone) {
                    console.error('❌ CRITICAL: No phone number found for session. Ensure "Phone number collection" is enabled in Stripe Payment Link.');
                    console.log('Session Data:', JSON.stringify({
                        id: session.id,
                        customer_details: session.customer_details,
                        metadata: session.metadata
                    }));
                    break;
                }

                console.log(`Saving subscriber for phone: ${phone}`);
                const periodEnd = new Date((subscription as any).current_period_end * 1000);

                await prisma.subscriber.upsert({
                    where: { phone },
                    update: {
                        stripeCustomerId: customerId,
                        stripeSubscriptionId: (subscription as any).id,
                        status: (subscription as any).status,
                        currentPeriodEnd: periodEnd,
                    },
                    create: {
                        phone,
                        stripeCustomerId: customerId,
                        stripeSubscriptionId: (subscription as any).id,
                        status: (subscription as any).status,
                        currentPeriodEnd: periodEnd,
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
