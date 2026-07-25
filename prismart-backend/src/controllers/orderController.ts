import { Response } from 'express';
import { prisma } from '../config/prisma';
import { sendSuccess, sendError } from '../utils/response';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';

interface CheckoutItem {
  productId: string;
  quantity: number;
}

export const checkout = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return sendError(res, 'Pengguna tidak terautentikasi.', null, 401);
    }

    const { items }: { items: CheckoutItem[] } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return sendError(res, 'Keranjang belanja tidak boleh kosong.', null, 400);
    }

    // Execute atomic transaction for stock validation, stock update, and order creation
    const newOrder = await prisma.$transaction(async (tx) => {
      let totalCalculatedAmount = 0;
      const orderItemsToCreate: Array<{
        productId: string;
        quantity: number;
        price: number;
      }> = [];

      for (const item of items) {
        if (!item.productId || !item.quantity || item.quantity <= 0) {
          throw new Error('Format item checkout tidak valid atau kuantitas kurang dari 1.');
        }

        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new Error(`Produk dengan ID ${item.productId} tidak ditemukan.`);
        }

        if (product.stock < item.quantity) {
          throw new Error(
            `Stok untuk produk "${product.name}" tidak mencukupi (Tersedia: ${product.stock}, Diminta: ${item.quantity}).`
          );
        }

        const unitPrice = Number(product.price);
        const itemTotal = unitPrice * item.quantity;
        totalCalculatedAmount += itemTotal;

        // Deduct stock
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });

        orderItemsToCreate.push({
          productId: item.productId,
          quantity: item.quantity,
          price: unitPrice,
        });
      }

      // Create Order and OrderItems
      const createdOrder = await tx.order.create({
        data: {
          userId,
          totalAmount: totalCalculatedAmount,
          status: 'PAID', // Dummy checkout automatically marks status as PAID
          orderItems: {
            create: orderItemsToCreate,
          },
        },
        include: {
          orderItems: {
            include: {
              product: true,
            },
          },
        },
      });

      return createdOrder;
    });

    return sendSuccess(res, 'Checkout berhasil diproses', newOrder, 201);
  } catch (error: any) {
    return sendError(
      res,
      error?.message || 'Gagal memproses checkout pesanan.',
      null,
      error?.statusCode || 400
    );
  }
};

export const getUserOrders = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return sendError(res, 'Pengguna tidak terautentikasi.', null, 401);
    }

    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });

    return sendSuccess(res, 'Riwayat pesanan berhasil diambil', orders, 200);
  } catch (error: any) {
    return sendError(res, 'Gagal mengambil riwayat pesanan', error?.message || error, 500);
  }
};
