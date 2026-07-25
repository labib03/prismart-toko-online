import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { sendSuccess, sendError } from '@/lib/response';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const reviews = await prisma.review.findMany({
      where: { productId: id },
      include: {
        user: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return sendSuccess('Ulasan produk berhasil diambil', { reviews });
  } catch (error: any) {
    return sendError('Gagal mengambil ulasan produk: ' + error.message, 500);
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser) {
      return sendError('Akses ditolak. Harap login untuk memberikan ulasan.', 401);
    }

    const { id } = params;
    const body = await req.json();
    const { rating, comment } = body;

    if (!rating || !comment) {
      return sendError('Rating dan ulasan wajib diisi.', 400);
    }

    const numericRating = Number(rating);
    if (numericRating < 1 || numericRating > 5) {
      return sendError('Rating harus di antara 1 dan 5.', 400);
    }

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      return sendError('Produk tidak ditemukan.', 404);
    }

    const review = await prisma.review.create({
      data: {
        rating: numericRating,
        comment,
        userId: authUser.id,
        productId: id,
      },
      include: {
        user: { select: { id: true, name: true } },
      },
    });

    return sendSuccess('Ulasan berhasil ditambahkan', { review }, 201);
  } catch (error: any) {
    return sendError('Gagal menambahkan ulasan: ' + error.message, 500);
  }
}
