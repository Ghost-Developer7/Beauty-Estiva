import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, fail, serverError } from "@/lib/api-response";
import { requireAuth } from "@/lib/api-middleware";
import { uploadImage, deleteImage } from "@/lib/cloudinary";

export async function POST(req: NextRequest) {
  try {
    const { user, error } = await requireAuth(req);
    if (error) return error;

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return fail("Dosya gereklidir");
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return fail("Sadece JPEG, PNG, GIF ve WebP formatları desteklenir");
    }

    if (file.size > 5 * 1024 * 1024) {
      return fail("Dosya boyutu 5MB'den büyük olamaz");
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const publicId = `user_${user!.id}`;
    const secureUrl = await uploadImage(buffer, "estiva/profiles", publicId);

    await prisma.users.update({
      where: { Id: user!.id },
      data: {
        ProfilePicturePath: secureUrl,
        UUser: user!.id,
        UDate: new Date(),
      },
    });

    return success({ profilePicturePath: secureUrl }, "Profil fotoğrafı güncellendi");
  } catch (error) {
    console.error("Profile picture upload error:", error);
    return serverError();
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { user, error } = await requireAuth(req);
    if (error) return error;

    const currentUser = await prisma.users.findUnique({
      where: { Id: user!.id },
      select: { ProfilePicturePath: true },
    });

    if (currentUser?.ProfilePicturePath) {
      try {
        await deleteImage(`estiva/profiles/user_${user!.id}`);
      } catch {
        // Ignore if image doesn't exist on Cloudinary
      }
    }

    await prisma.users.update({
      where: { Id: user!.id },
      data: {
        ProfilePicturePath: null,
        UUser: user!.id,
        UDate: new Date(),
      },
    });

    return success(null, "Profil fotoğrafı silindi");
  } catch (error) {
    console.error("Profile picture delete error:", error);
    return serverError();
  }
}
