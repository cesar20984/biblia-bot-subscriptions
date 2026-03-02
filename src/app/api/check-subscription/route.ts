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

    try {
        // Buscamos al suscriptor por teléfono
        const subscriber = await prisma.subscriber.findUnique({
            where: { phone },
        });

        if (!subscriber) {
            return NextResponse.json({
                active: false,
                status: 'not_found',
                message: 'Usuario no registrado'
            });
        }

        const now = new Date();
        const isPeriodValid = subscriber.currentPeriodEnd ? new Date(subscriber.currentPeriodEnd) > now : false;

        // Lógica: Está activo si el estado es 'active' O si aún no ha vencido su periodo pagado
        const isActive = subscriber.status === 'active' || (subscriber.status !== 'canceled' && isPeriodValid);

        return NextResponse.json({
            active: isActive,
            status: subscriber.status,
            currentPeriodEnd: subscriber.currentPeriodEnd,
            phone: subscriber.phone
        });

    } catch (error) {
        console.error('Error al verificar suscripción:', error);
        return NextResponse.json({ error: 'Error interno' }, { status: 500 });
    }
}
