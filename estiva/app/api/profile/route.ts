import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, fail, serverError } from "@/lib/api-response";
import { requireAuth } from "@/lib/api-middleware";

export async function GET(req: NextRequest) {
  try {
    const { user, error } = await requireAuth(req);
    if (error) return error;

    const dbUser = await prisma.users.findUnique({
      where: { Id: user!.id },
      include: {
        UserRoles: {
          include: { Roles: { select: { Name: true } } },
        },
      },
    });

    if (!dbUser) return fail("Kullanıcı bulunamadı", "NOT_FOUND", 404);

    return success({
      id: dbUser.Id,
      name: dbUser.Name,
      surname: dbUser.Surname,
      email: dbUser.Email,
      phone: dbUser.PhoneNumber,
      birthDate: dbUser.BirthDate,
      profilePicturePath: dbUser.ProfilePicturePath,
      roles: dbUser.UserRoles.map((ur) => ur.Roles.Name).filter(Boolean),
    });
  } catch (error) {
    console.error("Profile GET error:", error);
    return serverError();
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { user, error } = await requireAuth(req);
    if (error) return error;

    const body = await req.json();
    const data: any = { UUser: user!.id, UDate: new Date() };

    if (body.name !== undefined) data.Name = body.name;
    if (body.surname !== undefined) data.Surname = body.surname;
    if (body.phone !== undefined) data.PhoneNumber = body.phone;
    if (body.birthDate !== undefined) data.BirthDate = body.birthDate ? new Date(body.birthDate) : null;

    // Do NOT allow email change
    if (body.email !== undefined) {
      return fail("Email adresi bu endpoint üzerinden değiştirilemez");
    }

    const updated = await prisma.users.update({
      where: { Id: user!.id },
      data,
    });

    return success(
      {
        id: updated.Id,
        name: updated.Name,
        surname: updated.Surname,
        phone: updated.PhoneNumber,
        birthDate: updated.BirthDate,
      },
      "Profil güncellendi"
    );
  } catch (error) {
    console.error("Profile PUT error:", error);
    return serverError();
  }
}
