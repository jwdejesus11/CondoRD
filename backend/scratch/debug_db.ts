import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  const units = await prisma.unit.findMany();
  const users = await prisma.user.findMany();
  const condos = await prisma.condo.findMany();
  
  console.log('--- CONDOS ---');
  console.log(condos.map(c => ({ id: c.id, nombre: c.nombre })));
  
  console.log('--- UNITS ---');
  console.log(units.map(u => ({ id: u.id, numero: u.numero, condoId: u.condoId })));
  
  console.log('--- USERS ---');
  console.log(users.map(u => ({ id: u.id, email: u.email })));
  
  await prisma.$disconnect();
}

main();
