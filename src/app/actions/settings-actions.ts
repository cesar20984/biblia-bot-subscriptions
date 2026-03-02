'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// Refactored for better stability
export async function updateBotNumber(number: string) {
    try {
        console.log('Updating bot number to:', number);
        const exists = await prisma.botSettings.findUnique({ where: { id: 1 } });
        if (exists) {
            await prisma.botSettings.update({
                where: { id: 1 },
                data: { botNumber: number }
            });
        } else {
            await prisma.botSettings.create({
                data: { id: 1, botNumber: number, stripePaymentLink: '', stripeCancelLink: '' }
            });
        }
        revalidatePath('/dashboard');
        return { success: true };
    } catch (error) {
        console.error('Error updating bot number:', error);
        return { success: false };
    }
}

export async function updateStripeLink(link: string) {
    try {
        console.log('Updating stripe link to:', link);
        const exists = await prisma.botSettings.findUnique({ where: { id: 1 } });
        if (exists) {
            await prisma.botSettings.update({
                where: { id: 1 },
                data: { stripePaymentLink: link }
            });
        } else {
            await prisma.botSettings.create({
                data: { id: 1, botNumber: '', stripePaymentLink: link, stripeCancelLink: '' }
            });
        }
        revalidatePath('/dashboard');
        return { success: true };
    } catch (error) {
        console.error('Error updating stripe link:', error);
        return { success: false };
    }
}

export async function updateStripeCancelLink(link: string) {
    try {
        console.log('Updating stripe cancel link to:', link);
        const exists = await prisma.botSettings.findUnique({ where: { id: 1 } });
        if (exists) {
            await prisma.botSettings.update({
                where: { id: 1 },
                data: { stripeCancelLink: link }
            });
        } else {
            await prisma.botSettings.create({
                data: { id: 1, botNumber: '', stripePaymentLink: '', stripeCancelLink: link }
            });
        }
        revalidatePath('/dashboard');
        return { success: true };
    } catch (error) {
        console.error('Error updating stripe cancel link:', error);
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
            stripePaymentLink: settings?.stripePaymentLink || '',
            stripeCancelLink: settings?.stripeCancelLink || ''
        };
    } catch (error) {
        console.error('Error fetching bot settings:', error);
        return { botNumber: '', stripePaymentLink: '', stripeCancelLink: '' };
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
