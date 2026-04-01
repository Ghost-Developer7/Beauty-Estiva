import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, serverError } from "@/lib/api-response";
import { requireRoles } from "@/lib/api-middleware";

// PUT /api/tenantsettings/profile — Update tenant profile
export async function PUT(req: NextRequest) {
  try {
    const { user, error } = await requireRoles(req, ["Owner", "Admin"]);
    if (error) return error;

    const body = await req.json();
    const { companyName, taxNumber, taxOffice, address, phone } = body;
    const now = new Date();

    await prisma.tenants.update({
      where: { Id: user!.tenantId },
      data: {
        ...(companyName !== undefined && { CompanyName: companyName }),
        ...(taxNumber !== undefined && { TaxNumber: taxNumber }),
        ...(taxOffice !== undefined && { TaxOffice: taxOffice }),
        ...(address !== undefined && { Address: address }),
        ...(phone !== undefined && { Phone: phone }),
        UUser: user!.id,
        UDate: now,
      },
    });

    return success(null, "Profil ayarları güncellendi.");
  } catch (error) {
    console.error("Tenant profile PUT error:", error);
    return serverError();
  }
}
