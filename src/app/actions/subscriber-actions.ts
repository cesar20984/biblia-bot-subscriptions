'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function deleteSubscriber(id: string) {
    try {
        await prisma.subscriber.delete({
            where: { id },
        });
        revalidatePath('/dashboard');
        return { success: true };
    } catch (error) {
        console.error('Error deleting subscriber:', error);
        return { success: false, error: 'No se pudo eliminar el suscriptor' };
    }
}

export async function toggleVipStatus(id: string, isVip: boolean) {
    try {
        if (isVip) {
            // Quitar VIP: volver a inactivo (o dejarlo como está si tiene Stripe, pero el usuario pidió quitar la insignia)
            await prisma.subscriber.update({
                where: { id },
                data: {
                    status: 'inactive',
                    currentPeriodEnd: null,
                },
            });
        } else {
            // Hacer VIP: status activo y fecha lejana
            await prisma.subscriber.update({
                where: { id },
                data: {
                    status: 'active',
                    currentPeriodEnd: new Date('2099-12-31'),
                    stripeSubscriptionId: null, // Si era de Stripe, al hacerlo VIP manual rompemos el vínculo para que sea puramente manual
                },
            });
        }
        revalidatePath('/dashboard');
        return { success: true };
    } catch (error) {
        console.error('Error toggling VIP status:', error);
        return { success: false };
    }
}

export async function updateSubscriberPhone(id: string, newPhone: string) {
    try {
        const cleanPhone = newPhone.replace('+', '');
        await prisma.subscriber.update({
            where: { id },
            data: { phone: cleanPhone },
        });
        revalidatePath('/dashboard');
        return { success: true };
    } catch (error) {
        console.error('Error updating phone:', error);
        return { success: false, error: 'El número ya existe o es inválido' };
    }
}

export async function updateSubscriberExpiration(id: string, date: string) {
    try {
        await prisma.subscriber.update({
            where: { id },
            data: {
                currentPeriodEnd: new Date(date),
                status: 'active' // Aseguramos que si le cambiamos la fecha, esté activo
            },
        });
        revalidatePath('/dashboard');
        return { success: true };
    } catch (error) {
        console.error('Error updating expiration:', error);
        return { success: false };
    }
}
