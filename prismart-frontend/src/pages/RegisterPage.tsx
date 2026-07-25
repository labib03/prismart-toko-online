import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Mail, Lock, User as UserIcon, Shield, AlertCircle, ArrowRight } from 'lucide-react';
import { apiRequest } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'USER' | 'ADMIN'>('USER');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Nama, email, dan password wajib diisi.');
      return;
    }

    if (password.length < 6) {
      setError('Password minimal 6 karakter.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await apiRequest<{ token: string; user: any }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password, role }),
      });

      if (res.success && res.data) {
        setAuth(res.data.token, res.data.user);
        navigate('/');
      } else {
        setError(res.message || 'Registrasi gagal. Coba email lain.');
      }
    } catch (err: any) {
      setError(err.message || 'Gagal terhubung ke server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-slate-200/80 rounded-3xl p-8 shadow-lg shadow-slate-200/50">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
            <UserPlus size={24} />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-1">
            Buat Akun Baru
          </h1>
          <p className="text-xs text-slate-500">
            Bergabung dengan Prismart untuk mulai berbelanja atau mengelola toko.
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3.5 bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl text-xs font-semibold mb-6">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">Nama Lengkap</label>
            <div className="relative flex items-center">
              <UserIcon size={18} className="absolute left-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Ahmad Fauzi"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/10 transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">Alamat Email</label>
            <div className="relative flex items-center">
              <Mail size={18} className="absolute left-3.5 text-slate-400" />
              <input
                type="email"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/10 transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">Password</label>
            <div className="relative flex items-center">
              <Lock size={18} className="absolute left-3.5 text-slate-400" />
              <input
                type="password"
                placeholder="Minimal 6 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/10 transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">Tipe Akun (Role)</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                className={`p-3 border rounded-xl flex items-start gap-2.5 text-left transition-all ${
                  role === 'USER'
                    ? 'border-indigo-600 bg-indigo-50/70 text-indigo-600 font-bold'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
                onClick={() => setRole('USER')}
              >
                <UserIcon size={18} className="mt-0.5" />
                <div>
                  <span className="block text-xs font-bold">Pelanggan</span>
                  <span className="block text-[10px] text-slate-500 font-normal">Belanja & Checkout</span>
                </div>
              </button>

              <button
                type="button"
                className={`p-3 border rounded-xl flex items-start gap-2.5 text-left transition-all ${
                  role === 'ADMIN'
                    ? 'border-purple-600 bg-purple-50 text-purple-600 font-bold'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
                onClick={() => setRole('ADMIN')}
              >
                <Shield size={18} className="mt-0.5" />
                <div>
                  <span className="block text-xs font-bold">Pengelola</span>
                  <span className="block text-[10px] text-slate-500 font-normal">Kelola Produk</span>
                </div>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-md shadow-indigo-600/25 transition-all duration-200 disabled:opacity-60"
          >
            {loading ? (
              <span>Membuat Akun...</span>
            ) : (
              <>
                <span>Daftar Sekarang</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="text-center mt-6 pt-6 border-t border-slate-100 text-xs text-slate-500">
          <p>
            Sudah memiliki akun?{' '}
            <Link to="/login" className="font-bold text-indigo-600 hover:underline">
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
