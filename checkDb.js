const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
    const payment = await prisma.payment.findUnique({
        where: { id: "cmlut1nto001gvurmkif82yae" }
    });
    console.log(payment);
}
main().finally(() => prisma.$disconnect());
