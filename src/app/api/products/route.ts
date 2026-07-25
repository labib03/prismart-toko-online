import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { sendSuccess, sendError } from '@/lib/response';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';

    const products = await prisma.product.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { description: { contains: search, mode: 'insensitive' } },
            ],
          }
        : undefined,
      orderBy: { createdAt: 'desc' },
    });

    return sendSuccess('Daftar produk berhasil diambil', { products });
  } catch (error: any) {
    return sendError('Gagal mengambil daftar produk: ' + error.message, 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser || authUser.role !== 'ADMIN') {
      return sendError('Akses ditolak. Hanya ADMIN yang dapat menambah produk.', 403);
    }

    const body = await req.json();
    const { name, description, price, stock, imageUrl } = body;

    if (!name || !description || price === undefined || stock === undefined || !imageUrl) {
      return sendError('Semua field wajib diisi.', 400);
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: Number(price),
        stock: Number(stock),
        imageUrl,
      },
    });

    return sendSuccess('Produk berhasil ditambahkan', { product }, 201);
  } catch (error: any) {
    return sendError('Gagal menambahkan produk: ' + error.message, 500);
  }
}
