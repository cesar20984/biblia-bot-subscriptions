'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function resetMessageCount(phone: string, date: string) {
    try {
        await prisma.messageLog.delete({
            where: {
                phone_date: {
                    phone,
                    date
                }
            }
        });
        revalidatePath('/dashboard');
        return { success: true };
    } catch (error) {
        console.error('Error resetting count:', error);
        return { success: false, error: 'No se pudo reiniciar el conteo' };
    }
}
