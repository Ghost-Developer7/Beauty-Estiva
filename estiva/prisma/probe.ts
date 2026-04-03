import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();

async function main() {
  const tenant = await p.tenants.findFirst({ where: { IsActive: true } });
  console.log("TENANT", tenant?.Id, tenant?.CompanyName);

  const staff = await p.users.findMany({
    where: { TenantId: tenant!.Id, IsActive: true },
    select: { Id: true, Name: true, Surname: true },
    take: 10,
  });
  console.log("STAFF", JSON.stringify(staff));

  const treats = await p.treatments.findMany({
    where: { TenantId: tenant!.Id, IsActive: true },
    select: { Id: true, Name: true, DurationMinutes: true, Price: true },
    take: 15,
  });
  console.log("TREATMENTS", JSON.stringify(treats));

  const currency = await p.currencies.findFirst({ where: { IsDefault: true } });
  console.log("CURRENCY", currency?.Id, currency?.Code);

  const custCount = await p.customers.count({ where: { TenantId: tenant!.Id } });
  console.log("CUSTOMER_COUNT", custCount);

  const apptCount = await p.appointments.count({ where: { TenantId: tenant!.Id, StartTime: { gte: new Date("2025-01-01") } } });
  console.log("APPT_COUNT_2025", apptCount);

  const expCats = await p.expenseCategories.findMany({
    where: { TenantId: tenant!.Id },
    select: { Id: true, Name: true },
  });
  console.log("EXP_CATS", JSON.stringify(expCats));
}

main().catch(console.error).finally(() => p.$disconnect());
