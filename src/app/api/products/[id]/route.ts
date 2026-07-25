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
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return sendError('Produk tidak ditemukan.', 404);
    }

    return sendSuccess('Detail produk berhasil diambil', { product });
  } catch (error: any) {
    return sendError('Gagal mengambil detail produk: ' + error.message, 500);
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser || authUser.role !== 'ADMIN') {
      return sendError('Akses ditolak. Hanya ADMIN yang dapat mengedit produk.', 403);
    }

    const { id } = params;
    const body = await req.json();
    const { name, description, price, stock, imageUrl } = body;

    const existingProduct = await prisma.product.findUnique({ where: { id } });
    if (!existingProduct) {
      return sendError('Produk tidak ditemukan.', 404);
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(price !== undefined && { price: Number(price) }),
        ...(stock !== undefined && { stock: Number(stock) }),
        ...(imageUrl && { imageUrl }),
      },
    });

    return sendSuccess('Produk berhasil diperbarui', { product: updatedProduct });
  } catch (error: any) {
    return sendError('Gagal memperbarui produk: ' + error.message, 500);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser || authUser.role !== 'ADMIN') {
      return sendError('Akses ditolak. Hanya ADMIN yang dapat menghapus produk.', 403);
    }

    const { id } = params;
    const existingProduct = await prisma.product.findUnique({ where: { id } });
    if (!existingProduct) {
      return sendError('Produk tidak ditemukan.', 404);
    }

    await prisma.product.delete({ where: { id } });

    return sendSuccess('Produk berhasil dihapus');
  } catch (error: any) {
    return sendError('Gagal menghapus produk: ' + error.message, 500);
  }
}
