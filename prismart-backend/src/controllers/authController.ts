import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma';
import { generateToken } from '../utils/jwt';
import { sendSuccess, sendError } from '../utils/response';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name, role } = req.body;

    if (!email || !password || !name) {
      return sendError(res, 'Email, password, dan nama wajib diisi.', null, 400);
    }

    if (password.length < 6) {
      return sendError(res, 'Password minimal terdiri dari 6 karakter.', null, 400);
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return sendError(res, 'Email sudah terdaftar.', null, 400);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userRole = role === 'ADMIN' ? 'ADMIN' : 'USER';

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: userRole,
      },
    });

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return sendSuccess(
      res,
      'Registrasi berhasil',
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
        },
        token,
      },
      201
    );
  } catch (error: any) {
    return sendError(res, 'Gagal melakukan registrasi', error?.message || error, 500);
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, 'Email dan password wajib diisi.', null, 400);
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return sendError(res, 'Email atau password salah.', null, 401);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return sendError(res, 'Email atau password salah.', null, 401);
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return sendSuccess(
      res,
      'Login berhasil',
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
        },
        token,
      },
      200
    );
  } catch (error: any) {
    return sendError(res, 'Gagal melakukan login', error?.message || error, 500);
  }
};

export const getMe = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return sendError(res, 'Pengguna tidak terautentikasi.', null, 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { orders: true },
        },
      },
    });

    if (!user) {
      return sendError(res, 'Pengguna tidak ditemukan.', null, 404);
    }

    return sendSuccess(res, 'Profil pengguna berhasil diambil', user, 200);
  } catch (error: any) {
    return sendError(res, 'Gagal mengambil data profil', error?.message || error, 500);
  }
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return sendError(res, 'Pengguna tidak terautentikasi.', null, 401);
    }

    const { name, email, oldPassword, newPassword } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return sendError(res, 'Pengguna tidak ditemukan.', null, 404);
    }

    const updateData: any = {};

    // Validate name if updated
    if (name && typeof name === 'string' && name.trim().length > 0) {
      updateData.name = name.trim();
    }

    // Validate email if updated
    if (email && email.trim() !== existingUser.email) {
      const emailCheck = await prisma.user.findUnique({
        where: { email: email.trim() },
      });
      if (emailCheck) {
        return sendError(res, 'Alamat email sudah digunakan oleh akun lain.', null, 400);
      }
      updateData.email = email.trim();
    }

    // Handle password change if requested
    if (newPassword) {
      if (!oldPassword) {
        return sendError(res, 'Password lama wajib diisi untuk mengubah password.', null, 400);
      }

      const isPasswordValid = await bcrypt.compare(oldPassword, existingUser.password);
      if (!isPasswordValid) {
        return sendError(res, 'Password lama tidak sesuai.', null, 400);
      }

      if (newPassword.length < 6) {
        return sendError(res, 'Password baru minimal terdiri dari 6 karakter.', null, 400);
      }

      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(newPassword, salt);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { orders: true },
        },
      },
    });

    // Generate new token if email changed or just return fresh token
    const token = generateToken({
      id: updatedUser.id,
      email: updatedUser.email,
      role: updatedUser.role,
    });

    return sendSuccess(
      res,
      'Profil pengguna berhasil diperbarui',
      {
        user: updatedUser,
        token,
      },
      200
    );
  } catch (error: any) {
    return sendError(res, 'Gagal memperbarui profil pengguna', error?.message || error, 500);
  }
};
