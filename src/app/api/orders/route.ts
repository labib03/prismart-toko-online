import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { sendSuccess, sendError } from '@/lib/response';

export async function GET(req: NextRequest) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser) {
      return sendError('Akses ditolak. Harap login terlebih dahulu.', 401);
    }

    const isUserAdmin = authUser.role === 'ADMIN';

    const orders = await prisma.order.findMany({
      where: isUserAdmin ? undefined : { userId: authUser.id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        orderItems: {
          include: {
            product: { select: { id: true, name: true, imageUrl: true, price: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return sendSuccess('Daftar pesanan berhasil diambil', { orders });
  } catch (error: any) {
    return sendError('Gagal mengambil daftar pesanan: ' + error.message, 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser) {
      return sendError('Akses ditolak. Harap login untuk membuat pesanan.', 401);
    }

    const body = await req.json();
    const { items } = body; // Array of { productId, quantity }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return sendError('Keranjang belanja kosong.', 400);
    }

    let totalAmount = 0;
    const orderItemsData = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        return sendError(`Produk dengan ID ${item.productId} tidak ditemukan.`, 404);
      }

      if (product.stock < item.quantity) {
        return sendError(`Stok produk "${product.name}" tidak mencukupi (Tersisa ${product.stock}).`, 400);
      }

      const itemTotalPrice = Number(product.price) * item.quantity;
      totalAmount += itemTotalPrice;

      orderItemsData.push({
        productId: product.id,
        quantity: item.quantity,
        price: product.price,
      });

      // Reduce stock
      await prisma.product.update({
        where: { id: product.id },
        data: { stock: product.stock - item.quantity },
      });
    }

    const order = await prisma.order.create({
      data: {
        userId: authUser.id,
        totalAmount,
        status: 'PENDING',
        orderItems: {
          create: orderItemsData,
        },
      },
      include: {
        orderItems: {
          include: { product: true },
        },
      },
    });

    return sendSuccess('Pesanan berhasil dibuat', { order }, 201);
  } catch (error: any) {
    return sendError('Gagal membuat pesanan: ' + error.message, 500);
  }
}
