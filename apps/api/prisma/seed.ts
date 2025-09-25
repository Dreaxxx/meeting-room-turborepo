import { PrismaClient } from '@prisma/client'
import * as argon2 from 'argon2'

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

    await prisma.user.create({
        data: {
            email: 'qHn0S@example.com',
            password: await argon2.hash('password'),
            name: 'John Doe',
        },
    })
}
main().finally(() => prisma.$disconnect())
