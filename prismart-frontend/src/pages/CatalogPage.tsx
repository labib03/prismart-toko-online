import React, { useState, useEffect } from 'react';
import { Search, Sparkles, AlertCircle } from 'lucide-react';
import { apiRequest } from '../services/api';
import { Product } from '../store/useCartStore';
import { ProductCard } from '../components/ProductCard';

export const CatalogPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async (query = '') => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = query ? `/products?search=${encodeURIComponent(query)}` : '/products';
      const res = await apiRequest<Product[]>(endpoint);
      if (res.success && Array.isArray(res.data)) {
        setProducts(res.data);
      } else {
        setError(res.message || 'Gagal memuat produk');
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan koneksi ke server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(search);
  }, [search]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Hero Section */}
      <section className="hero-gradient border border-slate-200/80 rounded-3xl p-8 sm:p-12 text-center mb-10 shadow-sm relative overflow-hidden">
        <div className="max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-600 border border-indigo-200/50 px-3.5 py-1 rounded-full text-xs font-bold mb-4">
            <Sparkles size={14} /> E-Commerce Platform Generasi Baru
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight mb-3">
            Temukan Produk Terbaik untuk Kebutuhan Anda
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto mb-8">
            Katalog terlengkap dengan sistem checkout super cepat dan manajemen stok terintegrasi secara real-time.
          </p>

          {/* Search Bar */}
          <div className="max-w-xl mx-auto relative flex items-center">
            <Search size={20} className="absolute left-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari produk berdasarkan nama atau deskripsi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-12 py-3.5 bg-white border border-slate-200 rounded-full text-sm font-medium text-slate-900 shadow-sm focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-4 text-xs font-bold text-slate-400 hover:text-slate-600"
              >
                Hapus
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Catalog Grid Section */}
      <main>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Semua Produk</h2>
          <span className="text-xs font-semibold text-slate-500">
            {loading ? 'Memuat...' : `${products.length} Produk Ditemukan`}
          </span>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-4 bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl text-sm font-semibold mb-6">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div key={n} className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col gap-3 animate-pulse">
                <div className="w-full h-44 bg-slate-200 rounded-xl"></div>
                <div className="w-3/4 h-4 bg-slate-200 rounded-md"></div>
                <div className="w-1/2 h-3 bg-slate-200 rounded-md"></div>
                <div className="w-full h-8 bg-slate-200 rounded-lg mt-auto"></div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white border border-slate-200 rounded-3xl">
            <div className="text-4xl mb-3">📦</div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Tidak Ada Produk Ditemukan</h3>
            <p className="text-sm text-slate-500">Coba kata kunci pencarian lain atau kembali beberapa saat lagi.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
