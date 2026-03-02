import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const cancelLink = 'https://billing.stripe.com/p/login/4gM6oHdYZ8OBcM2ePy8AE00';

    const settings = await prisma.botSettings.upsert({
        where: { id: 1 },
        update: {
            stripeCancelLink: cancelLink
        },
        create: {
            id: 1,
            botNumber: '',
            stripePaymentLink: '',
            stripeCancelLink: cancelLink
        }
    });

    console.log('✅ Settings updated with cancel link:', settings.stripeCancelLink);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
