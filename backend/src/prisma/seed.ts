import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const adminPassword = await bcrypt.hash('admin123', 10);

  const owner = await prisma.user.upsert({
    where: { email: 'admin@barberflow.com' },
    update: {},
    create: {
      email: 'admin@barberflow.com',
      password: adminPassword,
      name: 'Administrador',
      role: 'OWNER',
      phone: '(11) 99999-9999',
    },
  });

  console.log('Admin user created:', owner.email);

  const services = await Promise.all([
    prisma.service.create({
      data: {
        name: 'Corte Masculino',
        description: 'Corte de cabelo masculino com tesoura e máquina',
        price: 50,
        duration: 40,
        category: 'Cortes',
      },
    }),
    prisma.service.create({
      data: {
        name: 'Barba',
        description: 'Aparação e modelagem de barba',
        price: 30,
        duration: 20,
        category: 'Barba',
      },
    }),
    prisma.service.create({
      data: {
        name: 'Corte + Barba',
        description: 'Combo corte masculino + barba',
        price: 70,
        duration: 60,
        category: 'Combos',
      },
    }),
    prisma.service.create({
      data: {
        name: 'Hidratação Capilar',
        description: 'Hidratação profunda para cabelos',
        price: 60,
        duration: 45,
        category: 'Tratamentos',
      },
    }),
    prisma.service.create({
      data: {
        name: 'Sobrancelha',
        description: 'Design de sobrancelha',
        price: 20,
        duration: 15,
        category: 'Estética',
      },
    }),
  ]);

  console.log(`${services.length} services created`);

  const barber = await prisma.employee.create({
    data: {
      name: 'João Barbeiro',
      phone: '(11) 98888-8888',
      cpf: '111.111.111-11',
      role: 'BARBER',
      commission: 40,
      workStartTime: '08:00',
      workEndTime: '18:00',
      workDays: '1,2,3,4,5,6',
    },
  });

  const barber2 = await prisma.employee.create({
    data: {
      name: 'Carlos Estilista',
      phone: '(11) 97777-7777',
      cpf: '222.222.222-22',
      role: 'BARBER',
      commission: 35,
      workStartTime: '09:00',
      workEndTime: '19:00',
      workDays: '1,2,3,4,5',
    },
  });

  console.log('Employees created');

  await Promise.all([
    prisma.employeeService.create({
      data: { employeeId: barber.id, serviceId: services[0].id },
    }),
    prisma.employeeService.create({
      data: { employeeId: barber.id, serviceId: services[1].id },
    }),
    prisma.employeeService.create({
      data: { employeeId: barber.id, serviceId: services[2].id },
    }),
    prisma.employeeService.create({
      data: { employeeId: barber2.id, serviceId: services[0].id },
    }),
    prisma.employeeService.create({
      data: { employeeId: barber2.id, serviceId: services[2].id },
    }),
    prisma.employeeService.create({
      data: { employeeId: barber2.id, serviceId: services[3].id },
    }),
  ]);

  const scheduleData = [];
  for (let day = 1; day <= 6; day++) {
    scheduleData.push(
      prisma.workSchedule.create({
        data: {
          employeeId: barber.id,
          dayOfWeek: day,
          startTime: '08:00',
          endTime: '18:00',
        },
      }),
    );
    if (day <= 5) {
      scheduleData.push(
        prisma.workSchedule.create({
          data: {
            employeeId: barber2.id,
            dayOfWeek: day,
            startTime: '09:00',
            endTime: '19:00',
          },
        }),
      );
    }
  }
  await Promise.all(scheduleData);

  const client = await prisma.client.create({
    data: {
      name: 'Pedro Cliente',
      phone: '(11) 95555-5555',
      email: 'pedro@email.com',
      totalVisits: 0,
      totalSpent: 0,
    },
  });

  console.log('Client created');

  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: 'Pomada Modeladora',
        description: 'Pomada para modelagem capilar 100g',
        price: 35,
        cost: 20,
        stock: 15,
        minStock: 5,
        category: 'Finalização',
      },
    }),
    prisma.product.create({
      data: {
        name: 'Shampoo Profissional',
        description: 'Shampoo para cabelos masculinos 300ml',
        price: 45,
        cost: 28,
        stock: 8,
        minStock: 3,
        category: 'Higiene',
      },
    }),
    prisma.product.create({
      data: {
        name: 'Óleo para Barba',
        description: 'Óleo hidratante para barba 30ml',
        price: 40,
        cost: 22,
        stock: 3,
        minStock: 5,
        category: 'Barba',
      },
    }),
  ]);

  console.log(`${products.length} products created`);
  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
