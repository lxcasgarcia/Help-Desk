import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Apaga todos os registros da tabela User
  await prisma.user.deleteMany();

  console.log("Todos os usuários foram deletados!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
