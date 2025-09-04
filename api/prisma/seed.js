// Seed em JavaScript para funcionar em produção (sem ts-node/tsx)
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed do banco de dados (JS)...");

  // Usuário admin
  console.log("👤 Criando usuário admin...");
  const hashedPassword = await bcrypt.hash("123456", 10);

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@gmail.com" },
    update: {},
    create: {
      email: "admin@gmail.com",
      password: hashedPassword,
      role: "admin",
      name: "Administrador",
    },
  });

  await prisma.adminProfile.upsert({
    where: { userId: adminUser.id },
    update: {},
    create: {
      userId: adminUser.id,
    },
  });

  console.log("✅ Usuário admin garantido: admin@gmail.com / 123456");

  const services = [
    { name: "Instalação de Rede", value: 150.0, active: true },
    { name: "Manutenção de Computador", value: 80.0, active: true },
    { name: "Configuração de Roteador", value: 60.0, active: true },
    { name: "Instalação de Software", value: 45.0, active: true },
    { name: "Backup de Dados", value: 100.0, active: true },
    { name: "Formatação de Sistema", value: 120.0, active: true },
    { name: "Configuração de Email", value: 35.0, active: true },
    { name: "Suporte Remoto", value: 50.0, active: true },
    { name: "Instalação de Impressora", value: 40.0, active: true },
    { name: "Recuperação de Dados", value: 200.0, active: true },
    { name: "Configuração de Servidor", value: 300.0, active: true },
    { name: "Treinamento de Usuário", value: 90.0, active: true },
  ];

  console.log("📋 Criando serviços (upsert)...");
  for (const service of services) {
    await prisma.service.upsert({
      where: { name: service.name },
      update: {},
      create: service,
    });
    console.log(`✅ Serviço ok: ${service.name}`);
  }

  console.log("🎉 Seed (JS) concluído!");
}

main()
  .catch((e) => {
    console.error("❌ Erro durante o seed (JS):", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


