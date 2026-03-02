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
