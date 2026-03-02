'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function updateBotNumber(number: string) {
    try {
        await prisma.botSettings.upsert({
            where: { id: 1 },
            update: { botNumber: number },
            create: { id: 1, botNumber: number, stripePaymentLink: '' },
        });
        revalidatePath('/dashboard');
        return { success: true };
    } catch (error) {
        console.error('Error updating bot number:', error);
        return { success: false };
    }
}

export async function updateStripeLink(link: string) {
    try {
        await prisma.botSettings.upsert({
            where: { id: 1 },
            update: { stripePaymentLink: link },
            create: { id: 1, botNumber: '', stripePaymentLink: link },
        });
        revalidatePath('/dashboard');
        return { success: true };
    } catch (error) {
        console.error('Error updating stripe link:', error);
        return { success: false };
    }
}

export async function getBotSettings() {
    try {
        const settings = await prisma.botSettings.findUnique({
            where: { id: 1 },
        });
        return {
            botNumber: settings?.botNumber || '',
            stripePaymentLink: settings?.stripePaymentLink || ''
        };
    } catch (error) {
        console.error('Error fetching bot settings:', error);
        return { botNumber: '', stripePaymentLink: '' };
    }
}

export async function addManualVip(phone: string) {
    try {
        const cleanPhone = phone.replace('+', '');
        await prisma.subscriber.upsert({
            where: { phone: cleanPhone },
            update: {
                status: 'active',
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
