"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    await prisma.room.createMany({
        data: [
            { name: 'Orion', capacity: 4 },
            { name: 'Vega', capacity: 8 },
            { name: 'Libra', capacity: 12 },
        ],
        skipDuplicates: true,
    });
}
main().finally(() => prisma.$disconnect());
