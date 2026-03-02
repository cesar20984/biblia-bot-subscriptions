'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function deleteSubscriber(id: string) {
    try {
        if (id.startsWith('temp-')) {
            // Si es temporal, no hay registro en Subscriber que borrar
            revalidatePath('/dashboard');
            return { success: true };
        }

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
        const isTemp = id.startsWith('temp-');
        const phone = isTemp ? id.replace('temp-', '') : null;

        if (isVip && !isTemp) {
            // Quitar VIP: volver a inactivo
            await prisma.subscriber.update({
                where: { id },
                data: {
                    status: 'inactive',
                    currentPeriodEnd: null,
                },
            });
        } else {
            // Hacer VIP: status activo y fecha lejana
            if (isTemp && phone) {
                await prisma.subscriber.upsert({
                    where: { phone },
                    create: {
                        phone,
                        status: 'active',
                        currentPeriodEnd: new Date('2099-12-31'),
                    },
                    update: {
                        status: 'active',
                        currentPeriodEnd: new Date('2099-12-31'),
                        stripeSubscriptionId: null,
                    }
                });
            } else {
                await prisma.subscriber.update({
                    where: { id },
                    data: {
                        status: 'active',
                        currentPeriodEnd: new Date('2099-12-31'),
                        stripeSubscriptionId: null,
                    },
                });
            }
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

        if (id.startsWith('temp-')) {
            // No podemos actualizar el ID temporal fácilmente aquí sin afectar logs, 
            // pero podemos crear al suscriptor con el nuevo teléfono
            const oldPhone = id.replace('temp-', '');
            await prisma.subscriber.upsert({
                where: { phone: oldPhone },
                create: { phone: cleanPhone },
                update: { phone: cleanPhone }
            });
        } else {
            await prisma.subscriber.update({
                where: { id },
                data: { phone: cleanPhone },
            });
        }

        revalidatePath('/dashboard');
        return { success: true };
    } catch (error) {
        console.error('Error updating phone:', error);
        return { success: false, error: 'El número ya existe o es inválido' };
    }
}

export async function updateSubscriberExpiration(id: string, date: string) {
    try {
        if (id.startsWith('temp-')) {
            const phone = id.replace('temp-', '');
            await prisma.subscriber.upsert({
                where: { phone },
                create: {
                    phone,
                    currentPeriodEnd: new Date(date),
                    status: 'active'
                },
                update: {
                    currentPeriodEnd: new Date(date),
                    status: 'active'
                }
            });
        } else {
            await prisma.subscriber.update({
                where: { id },
                data: {
                    currentPeriodEnd: new Date(date),
                    status: 'active'
                },
            });
        }
        revalidatePath('/dashboard');
        return { success: true };
    } catch (error) {
        console.error('Error updating expiration:', error);
        return { success: false };
    }
}
