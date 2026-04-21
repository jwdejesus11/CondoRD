import { PrismaClient, AdminRole, CaseStatus, VisitStatus, LostFoundStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Verificando datos base...');

  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  // Upsert Admin User
  const admin = await prisma.user.upsert({
    where: { email: 'admin@condord.com' },
    update: {},
    create: {
      email: 'admin@condord.com',
      nombre: 'Jorge Méndez',
      password: hashedPassword,
    },
  });

  // Buscar o crear Condominio base
  let condo = await prisma.condo.findFirst({
    where: { OR: [{ rnc: '1-33-12345-6' }, { nombre: 'Torre Alco Paradisso' }] }
  });

  if (!condo) {
    condo = await prisma.condo.create({
      data: {
        nombre: 'Torre Alco Paradisso',
        rnc: '1-33-12345-6',
        direccion: 'C. Federico Geraldino 94, Santo Domingo',
        tasaMora: 5.0,
        diaCorte: 1,
      },
    });
  }

  // Vincular Admin a Condo si no existe
  await prisma.userCondo.upsert({
    where: { userId_condoId: { userId: admin.id, condoId: condo.id } },
    update: {},
    create: {
      userId: admin.id,
      condoId: condo.id,
      role: AdminRole.CONDO_ADMIN,
    },
  });

  console.log('Seed completed successfully - Minimal setup for new client.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
