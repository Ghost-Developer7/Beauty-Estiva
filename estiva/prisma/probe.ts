import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();

async function main() {
  // Find user by email
  const user = await p.users.findFirst({
    where: { Email: "karamhmt.0793@gmail.com" },
    select: { Id: true, TenantId: true, Name: true, Surname: true, Email: true },
  });
  console.log("USER:", JSON.stringify(user));

  if (user?.TenantId) {
    const tenant = await p.tenants.findUnique({
      where: { Id: user.TenantId },
    });
    console.log("TENANT:", JSON.stringify(tenant));

    const staff = await p.users.findMany({
      where: { TenantId: user.TenantId, IsActive: true },
      select: { Id: true, Name: true, Surname: true },
    });
    console.log("STAFF:", JSON.stringify(staff));

    const currencies = await p.currencies.findMany({
      select: { Id: true, Code: true, Name: true, IsDefault: true },
    });
    console.log("CURRENCIES:", JSON.stringify(currencies));

    const treatments = await p.treatments.findMany({
      where: { TenantId: user.TenantId },
      select: { Id: true, Name: true, DurationMinutes: true, Price: true },
    });
    console.log("TREATMENTS:", JSON.stringify(treatments));

    const custCount = await p.customers.count({ where: { TenantId: user.TenantId } });
    console.log("CUSTOMER_COUNT:", custCount);

    const expCats = await p.expenseCategories.findMany({
      where: { TenantId: user.TenantId },
      select: { Id: true, Name: true },
    });
    console.log("EXPENSE_CATS:", JSON.stringify(expCats));

    const products = await p.products.findMany({
      where: { TenantId: user.TenantId },
      select: { Id: true, Name: true },
    });
    console.log("PRODUCTS:", JSON.stringify(products));
  }
}

main().catch(console.error).finally(() => p.$disconnect());
