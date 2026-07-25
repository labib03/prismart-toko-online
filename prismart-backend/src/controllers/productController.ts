import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { sendSuccess, sendError } from '../utils/response';

export const getProducts = async (req: Request, res: Response) => {
  try {
    const { search } = req.query;

    const whereCondition = search
      ? {
          OR: [
            { name: { contains: String(search), mode: 'insensitive' as const } },
            { description: { contains: String(search), mode: 'insensitive' as const } },
          ],
        }
      : {};

    const products = await prisma.product.findMany({
      where: whereCondition,
      orderBy: { createdAt: 'desc' },
    });

    return sendSuccess(res, 'Daftar produk berhasil diambil', products, 200);
  } catch (error: any) {
    return sendError(res, 'Gagal mengambil daftar produk', error?.message || error, 500);
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return sendError(res, 'Produk tidak ditemukan', null, 404);
    }

    return sendSuccess(res, 'Detail produk berhasil diambil', product, 200);
  } catch (error: any) {
    return sendError(res, 'Gagal mengambil detail produk', error?.message || error, 500);
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, description, price, stock, imageUrl } = req.body;

    if (!name || price === undefined || stock === undefined) {
      return sendError(res, 'Nama, harga, dan stok wajib diisi.', null, 400);
    }

    const numericPrice = Number(price);
    const numericStock = Number(stock);

    if (isNaN(numericPrice) || numericPrice < 0) {
      return sendError(res, 'Harga harus berupa angka positif.', null, 400);
    }

    if (isNaN(numericStock) || numericStock < 0) {
      return sendError(res, 'Stok harus berupa angka non-negatif.', null, 400);
    }

    const product = await prisma.product.create({
      data: {
        name,
        description: description || '',
        price: numericPrice,
        stock: numericStock,
        imageUrl: imageUrl || 'https://via.placeholder.com/300',
      },
    });

    return sendSuccess(res, 'Produk berhasil ditambahkan', product, 201);
  } catch (error: any) {
    return sendError(res, 'Gagal menambahkan produk', error?.message || error, 500);
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { name, description, price, stock, imageUrl } = req.body;

    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return sendError(res, 'Produk tidak ditemukan', null, 404);
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) {
      const p = Number(price);
      if (isNaN(p) || p < 0) return sendError(res, 'Harga tidak valid.', null, 400);
      updateData.price = p;
    }
    if (stock !== undefined) {
      const s = Number(stock);
      if (isNaN(s) || s < 0) return sendError(res, 'Stok tidak valid.', null, 400);
      updateData.stock = s;
    }
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: updateData,
    });

    return sendSuccess(res, 'Produk berhasil diperbarui', updatedProduct, 200);
  } catch (error: any) {
    return sendError(res, 'Gagal memperbarui produk', error?.message || error, 500);
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return sendError(res, 'Produk tidak ditemukan', null, 404);
    }

    await prisma.product.delete({
      where: { id },
    });

    return sendSuccess(res, 'Produk berhasil dihapus', null, 200);
  } catch (error: any) {
    return sendError(res, 'Gagal menghapus produk', error?.message || error, 500);
  }
};
