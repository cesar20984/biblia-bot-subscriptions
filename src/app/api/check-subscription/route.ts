import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone');
    const apiKey = request.headers.get('x-api-key');

    // Seguridad básica opcional: solo permite que n8n consulte si tiene la clave correcta
    if (process.env.CHECK_API_KEY && apiKey !== process.env.CHECK_API_KEY) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    if (!phone) {
        return NextResponse.json({ error: 'Número de teléfono requerido' }, { status: 400 });
    }

    // Normalizar teléfono: quitar el "+" si viene de n8n o WhatsApp
    const cleanPhone = phone.replace('+', '');

    try {
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0]; // YYYY-MM-DD

        // 1. Buscamos al suscriptor por teléfono
        const subscriber = await prisma.subscriber.findUnique({
            where: { phone: cleanPhone },
        });

        const isPeriodValid = subscriber?.currentPeriodEnd ? new Date(subscriber.currentPeriodEnd) > now : false;

        // El usuario es VIP si tiene estado activo o si canceló pero el periodo no ha vencido
        const isVip = subscriber?.status === 'active' || (subscriber?.status === 'canceled' && isPeriodValid);

        if (isVip) {
            return NextResponse.json({
                active: true,
                status: subscriber?.status,
                isVip: true,
                message: 'Usuario Premium activo'
            });
        }

        // 2. Si NO es VIP, gestionamos el conteo de mensajes gratuitos
        // Intentamos incrementar o crear el registro para hoy
        const log = await prisma.messageLog.upsert({
            where: {
                phone_date: {
                    phone: cleanPhone,
                    date: todayStr
                }
            },
            create: {
                phone: cleanPhone,
                date: todayStr,
                count: 1
            },
            update: {
                count: { increment: 1 }
            }
        });

        const freeMessagesRemaining = Math.max(0, 2 - log.count);
        const canSend = log.count <= 2;

        return NextResponse.json({
            active: canSend,
            isVip: false,
            remaining: freeMessagesRemaining,
            message: canSend ? `Mensaje gratuito ${log.count}/2` : 'Límite diario alcanzado'
        });

    } catch (error) {
        console.error('Error al procesar solicitud:', error);
        return NextResponse.json({ error: 'Error interno' }, { status: 500 });
    }
}
