import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { sendSuccess, sendError } from '@/lib/response';

export async function GET(req: NextRequest) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser) {
      return sendError('Akses ditolak. Harap login terlebih dahulu.', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: {
          select: { orders: true },
        },
      },
    });

    if (!user) {
      return sendError('Pengguna tidak ditemukan.', 404);
    }

    return sendSuccess('Data profil pengguna berhasil diambil', { user });
  } catch (error: any) {
    return sendError('Gagal mengambil data profil: ' + error.message, 500);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser) {
      return sendError('Akses ditolak. Harap login terlebih dahulu.', 401);
    }

    const body = await req.json();
    const { name, email, password } = body;

    const existingUser = await prisma.user.findUnique({ where: { id: authUser.id } });
    if (!existingUser) {
      return sendError('Pengguna tidak ditemukan.', 404);
    }

    let hashedPassword = existingUser.password;
    if (password && password.trim().length > 0) {
      if (password.length < 6) {
        return sendError('Password baru minimal terdiri dari 6 karakter.', 400);
      }
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(password, salt);
    }

    const updatedUser = await prisma.user.update({
      where: { id: authUser.id },
      data: {
        name: name || existingUser.name,
        email: email || existingUser.email,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return sendSuccess('Profil berhasil diperbarui', { user: updatedUser });
  } catch (error: any) {
    return sendError('Gagal memperbarui profil: ' + error.message, 500);
  }
}
