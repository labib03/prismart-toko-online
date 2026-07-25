import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { sendSuccess, sendError } from '@/lib/response';

export async function GET(req: NextRequest) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser) {
      return sendError('Akses ditolak. Token tidak ditemukan atau tidak valid.', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return sendError('Pengguna tidak ditemukan.', 404);
    }

    return sendSuccess('Data pengguna berhasil didapatkan', { user });
  } catch (error: any) {
    return sendError('Gagal mengambil data profil: ' + error.message, 500);
  }
}
