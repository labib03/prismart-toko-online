import React, { useState, useEffect } from 'react';
import { User as UserIcon, Mail, Lock, Shield, Calendar, ShoppingBag, CheckCircle2, AlertCircle, Save } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { apiRequest } from '../services/api';

export const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuthStore();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<any>(user);

  useEffect(() => {
    const fetchFreshProfile = async () => {
      try {
        const res = await apiRequest<any>('/auth/me');
        if (res.success && res.data) {
          setProfileData(res.data);
          setName(res.data.name);
          setEmail(res.data.email);
          updateUser(res.data);
        }
      } catch (err: any) {
        console.error('Failed to fetch profile:', err);
      }
    };

    fetchFreshProfile();
  }, []);

  const formatDate = (isoString?: string) => {
    if (!isoString) return 'Tidak diketahui';
    return new Date(isoString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim()) {
      setError('Nama lengkap dan email wajib diisi.');
      return;
    }

    if (newPassword && !oldPassword) {
      setError('Silakan masukkan password lama Anda untuk mengkonfirmasi ubah password.');
      return;
    }

    if (newPassword && newPassword.length < 6) {
      setError('Password baru minimal 6 karakter.');
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await apiRequest<{ user: any; token: string }>('/auth/me', {
        method: 'PUT',
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          oldPassword: oldPassword || undefined,
          newPassword: newPassword || undefined,
        }),
      });

      if (res.success && res.data) {
        setSuccess('Profil Anda berhasil diperbarui!');
        updateUser(res.data.user, res.data.token);
        setProfileData(res.data.user);
        setOldPassword('');
        setNewPassword('');
      } else {
        setError(res.message || 'Gagal memperbarui profil.');
      }
    } catch (err: any) {
      setError(err.message || 'Gagal terhubung ke server.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-1">
          Pengaturan Profil Saya
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Kelola rincian akun, alamat email terdaftar, dan pembaruan kata sandi.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl text-sm font-semibold mb-6">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 p-4 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-2xl text-sm font-semibold mb-6">
          <CheckCircle2 size={20} />
          <span>{success}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Summary Card */}
        <div className="lg:col-span-4 bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs self-start text-center space-y-6">
          <div className="relative inline-block">
            <div className="w-24 h-24 rounded-full brand-gradient text-white flex items-center justify-center text-3xl font-black mx-auto shadow-lg shadow-indigo-500/20">
              {profileData?.name ? profileData.name[0].toUpperCase() : 'U'}
            </div>
            {profileData?.role === 'ADMIN' && (
              <span className="absolute bottom-0 right-0 bg-purple-600 text-white p-1.5 rounded-full border-2 border-white shadow-xs" title="Administrator">
                <Shield size={14} />
              </span>
            )}
          </div>

          <div>
            <h2 className="text-xl font-extrabold text-slate-900">{profileData?.name}</h2>
            <p className="text-xs text-slate-500 font-medium">{profileData?.email}</p>
          </div>

          <div className="flex justify-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              profileData?.role === 'ADMIN'
                ? 'bg-purple-50 text-purple-700 border border-purple-200'
                : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
            }`}>
              {profileData?.role === 'ADMIN' ? 'Administrator Toko' : 'Pelanggan Terverifikasi'}
            </span>
          </div>

          <div className="pt-6 border-t border-slate-100 space-y-3 text-left text-xs">
            <div className="flex items-center justify-between py-1">
              <span className="flex items-center gap-2 text-slate-500">
                <Calendar size={15} className="text-slate-400" />
                Bergabung Sejak:
              </span>
              <strong className="text-slate-800">{formatDate(profileData?.createdAt)}</strong>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="flex items-center gap-2 text-slate-500">
                <ShoppingBag size={15} className="text-slate-400" />
                Total Pesanan Selesai:
              </span>
              <strong className="text-indigo-600 font-extrabold text-sm">
                {profileData?._count?.orders ?? 0} Pesanan
              </strong>
            </div>
          </div>
        </div>

        {/* Right Column: Edit Form */}
        <div className="lg:col-span-8 bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs">
          <h2 className="text-lg font-bold text-slate-900 mb-6 pb-4 border-b border-slate-100 flex items-center gap-2">
            <UserIcon size={20} className="text-indigo-600" />
            <span>Form Edit Detail Profil</span>
          </h2>

          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Informasi Dasar</h3>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">Nama Lengkap</label>
                <div className="relative flex items-center">
                  <UserIcon size={18} className="absolute left-3.5 text-slate-400" />
                  <input
                    type="text"
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/10 transition-all"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Ubah Password (Opsional)</h3>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">Password Lama</label>
                <div className="relative flex items-center">
                  <Lock size={18} className="absolute left-3.5 text-slate-400" />
                  <input
                    type="password"
                    placeholder="Masukkan password lama untuk konfirmasi"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/10 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">Password Baru</label>
                <div className="relative flex items-center">
                  <Lock size={18} className="absolute left-3.5 text-slate-400" />
                  <input
                    type="password"
                    placeholder="Minimal 6 karakter baru"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/10 transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-600/25 transition-all disabled:opacity-60"
              >
                <Save size={18} />
                <span>{submitting ? 'Menyimpan Perubahan...' : 'Simpan Perubahan Profil'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
