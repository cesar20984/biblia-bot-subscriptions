'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function updateBotNumber(botNumber: string) {
    try {
        await prisma.botSettings.upsert({
            where: { id: 1 },
            update: { botNumber },
            create: { id: 1, botNumber },
        });
        revalidatePath('/dashboard');
        revalidatePath('/success');
        return { success: true };
    } catch (error) {
        console.error('Error updating bot number:', error);
        return { success: false, error: 'No se pudo actualizar el número' };
    }
}

export async function getBotNumber() {
    try {
        const settings = await prisma.botSettings.findUnique({
            where: { id: 1 },
        });
        return settings?.botNumber || '';
    } catch (error) {
        console.error('Error fetching bot number:', error);
        return '';
    }
}

export async function addManualVip(phone: string) {
    try {
        const cleanPhone = phone.replace('+', '');
        await prisma.subscriber.upsert({
            where: { phone: cleanPhone },
            update: {
                status: 'active',
                // Seteamos una fecha muy lejana para que siempre sea VIP
                currentPeriodEnd: new Date('2099-12-31'),
            },
            create: {
                phone: cleanPhone,
                status: 'active',
                currentPeriodEnd: new Date('2099-12-31'),
            },
        });
        revalidatePath('/dashboard');
        return { success: true };
    } catch (error) {
        console.error('Error adding manual VIP:', error);
        return { success: false };
    }
}

