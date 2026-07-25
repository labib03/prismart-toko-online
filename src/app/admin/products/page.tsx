'use client';

import React, { useState, useEffect } from 'react';
import { Shield, Plus, Pencil, Trash2, AlertCircle, CheckCircle2, Package, X } from 'lucide-react';
import { apiRequest } from '@/services/api';
import { Product } from '@/store/useCartStore';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await apiRequest<{ products: Product[] }>('/products');
      const list = res.data?.products || (Array.isArray(res.data) ? res.data : []);
      if (res.success && Array.isArray(list)) {
        setProducts(list);
      }
    } catch (err: any) {
      setError(err.message || 'Gagal memuat produk');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setDescription('');
    setPrice('');
    setStock('');
    setImageUrl('');
  };

  const startEdit = (product: Product) => {
    setEditingId(product.id);
    setName(product.name);
    setDescription(product.description || '');
    setPrice(String(product.price));
    setStock(String(product.stock));
    setImageUrl(product.imageUrl || '');
    setError(null);
    setSuccess(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !stock) {
      setError('Nama, harga, dan stok wajib diisi.');
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    const payload = {
      name,
      description,
      price: Number(price),
      stock: Number(stock),
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30',
    };

    try {
      let res;
      if (editingId) {
        res = await apiRequest<{ product: Product }>(`/products/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } else {
        res = await apiRequest<{ product: Product }>('/products', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }

      const prodData = res.data?.product;
      if (res.success && prodData) {
        setSuccess(
          editingId
            ? `Produk "${prodData.name}" berhasil diperbarui!`
            : `Produk "${prodData.name}" berhasil ditambahkan!`
        );
        resetForm();
        fetchProducts();
      } else {
        setError(res.message || (editingId ? 'Gagal mengedit produk' : 'Gagal menambahkan produk'));
      }
    } catch (err: any) {
      setError(err.message || 'Gagal terhubung ke server.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id: string, prodName: string) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus produk "${prodName}"?`)) return;

    try {
      const res = await apiRequest(`/products/${id}`, {
        method: 'DELETE',
      });

      if (res.success) {
        setSuccess(`Produk "${prodName}" berhasil dihapus.`);
        if (editingId === id) resetForm();
        fetchProducts();
      } else {
        setError(res.message || 'Gagal menghapus produk');
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan server.');
    }
  };

  const formatRupiah = (val: number | string) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(Number(val));
  };

  return (
    <ProtectedRoute requireAdmin={true}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <span className="inline-flex items-center gap-1.5 bg-purple-50 text-purple-700 border border-purple-200 text-xs font-bold px-3 py-1 rounded-full mb-3">
            <Shield size={14} /> Panel Otorisasi Admin
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-1 font-display">
            Manajemen Produk Toko
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Tambah, edit, pantau stok, dan hapus produk katalog langsung dari sistem backend Next.js.
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-4 bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl text-sm font-semibold mb-6">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 p-4 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-2xl text-sm font-semibold mb-6">
            <CheckCircle2 size={18} />
            <span>{success}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Form Tambah / Edit Produk */}
          <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs self-start">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 font-display">
                {editingId ? (
                  <>
                    <Pencil size={18} className="text-amber-600" />
                    <span>Edit Produk</span>
                  </>
                ) : (
                  <>
                    <Plus size={18} className="text-indigo-600" />
                    <span>Tambah Produk Baru</span>
                  </>
                )}
              </h2>

              {editingId && (
                <button
                  onClick={resetForm}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg transition-colors"
                >
                  <X size={14} />
                  <span>Batal Edit</span>
                </button>
              )}
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">Nama Produk *</label>
                <input
                  type="text"
                  placeholder="Contoh: Wireless Headphones"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/10 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">Deskripsi Produk</label>
                <textarea
                  placeholder="Tuliskan spesifikasi & deskripsi ringkas..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/10 transition-all resize-y"
                  rows={3}
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">Harga (IDR) *</label>
                  <input
                    type="number"
                    placeholder="1500000"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/10 transition-all"
                    min="0"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">Jumlah Stok *</label>
                  <input
                    type="number"
                    placeholder="10"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/10 transition-all"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">URL Gambar (Unsplash)</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/10 transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className={`w-full py-3 text-white rounded-xl text-sm font-bold shadow-md transition-all mt-2 disabled:opacity-60 ${
                  editingId
                    ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/25'
                    : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/25'
                }`}
              >
                {submitting ? (
                  <span>Menyimpan Produk...</span>
                ) : editingId ? (
                  <span>Update Produk</span>
                ) : (
                  <span>+ Simpan Produk Baru</span>
                )}
              </button>
            </form>
          </div>

          {/* Tabel Daftar Produk */}
          <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 font-display">
                <Package size={18} className="text-indigo-600" />
                <span>Daftar Produk ({products.length})</span>
              </h2>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-sm">
                <p>Belum ada produk tersimpan di database.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 font-bold">
                      <th className="p-3">Produk</th>
                      <th className="p-3">Harga</th>
                      <th className="p-3">Stok</th>
                      <th className="p-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {products.map((prod) => (
                      <tr
                        key={prod.id}
                        className={`transition-colors ${
                          editingId === prod.id ? 'bg-amber-50/50' : 'hover:bg-slate-50/50'
                        }`}
                      >
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={prod.imageUrl}
                              alt={prod.name}
                              className="w-10 h-10 object-cover rounded-lg bg-slate-100 shrink-0"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  'https://images.unsplash.com/photo-1523275335684-37898b6baf30';
                              }}
                            />
                            <div className="min-w-0">
                              <div className="font-bold text-slate-900 truncate">{prod.name}</div>
                              <div className="text-[10px] text-slate-400 font-mono">{prod.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 font-semibold text-slate-800 font-display">{formatRupiah(prod.price)}</td>
                        <td className="p-3">
                          <span
                            className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
                              prod.stock > 0
                                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                                : 'bg-rose-50 text-rose-600 border border-rose-200'
                            }`}
                          >
                            {prod.stock} unit
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              onClick={() => startEdit(prod)}
                              className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                              title="Edit Produk"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(prod.id, prod.name)}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Hapus Produk"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
