import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { sendSuccess, sendError } from '@/lib/response';
import { OrderStatus } from '@prisma/client';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser || authUser.role !== 'ADMIN') {
      return sendError('Akses ditolak. Hanya ADMIN yang dapat mengonfirmasi atau mengubah status pesanan.', 403);
    }

    const { id } = params;
    const body = await req.json();
    const { status } = body;

    if (!status || !Object.values(OrderStatus).includes(status)) {
      return sendError('Status pesanan tidak valid.', 400);
    }

    const existingOrder = await prisma.order.findUnique({ where: { id } });
    if (!existingOrder) {
      return sendError('Pesanan tidak ditemukan.', 404);
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        user: { select: { id: true, name: true, email: true } },
        orderItems: { include: { product: true } },
      },
    });

    return sendSuccess('Status pesanan berhasil diperbarui', { order: updatedOrder });
  } catch (error: any) {
    return sendError('Gagal memperbarui status pesanan: ' + error.message, 500);
  }
}
