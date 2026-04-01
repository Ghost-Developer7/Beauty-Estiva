import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, fail, serverError } from "@/lib/api-response";
import { requireAuth } from "@/lib/api-middleware";
import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const { user, error } = await requireAuth(req);
    if (error) return error;

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return fail("Dosya gereklidir");
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return fail("Sadece JPEG, PNG, GIF ve WebP formatları desteklenir");
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return fail("Dosya boyutu 5MB'den büyük olamaz");
    }

    const ext = file.name.split(".").pop() || "jpg";
    const timestamp = Date.now();
    const fileName = `${user!.id}_${timestamp}.${ext}`;

    const uploadDir = path.join(process.cwd(), "public", "profilePictures");
    await mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, fileName);
    const bytes = await file.arrayBuffer();
    await writeFile(filePath, Buffer.from(bytes));

    // Delete old profile picture if exists
    const currentUser = await prisma.users.findUnique({
      where: { Id: user!.id },
      select: { ProfilePicturePath: true },
    });

    if (currentUser?.ProfilePicturePath) {
      try {
        const oldFilePath = path.join(process.cwd(), "public", currentUser.ProfilePicturePath);
        await unlink(oldFilePath);
      } catch {
        // Ignore if old file doesn't exist
      }
    }

    const picturePath = `/profilePictures/${fileName}`;

    await prisma.users.update({
      where: { Id: user!.id },
      data: {
        ProfilePicturePath: picturePath,
        UUser: user!.id,
        UDate: new Date(),
      },
    });

    return success({ profilePicturePath: picturePath }, "Profil fotoğrafı güncellendi");
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
        const filePath = path.join(process.cwd(), "public", currentUser.ProfilePicturePath);
        await unlink(filePath);
      } catch {
        // Ignore if file doesn't exist
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
