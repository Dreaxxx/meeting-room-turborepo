import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
    await prisma.room.createMany({
        data: [
            { name: 'Orion', capacity: 4 },
            { name: 'Vega', capacity: 8 },
            { name: 'Libra', capacity: 12 },
        ],
        skipDuplicates: true,
    })
}
main().finally(() => prisma.$disconnect())
