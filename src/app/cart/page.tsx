'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Trash2, Plus, Minus, CreditCard, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { apiRequest } from '@/services/api';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, getTotalAmount } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successOrder, setSuccessOrder] = useState<any | null>(null);
  const router = useRouter();

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleCheckout = async () => {
    if (items.length === 0) return;

    setLoading(true);
    setError(null);

    const payloadItems = items.map((item) => ({
      productId: item.product.id,
      quantity: item.quantity,
    }));

    try {
      const res = await apiRequest<{ order: any }>('/orders', {
        method: 'POST',
        body: JSON.stringify({ items: payloadItems }),
      });

      if (res.success && res.data?.order) {
        setSuccessOrder(res.data.order);
        clearCart();
      } else {
        setError(res.message || 'Gagal memproses checkout.');
      }
    } catch (err: any) {
      setError(err.message || 'Gagal terhubung ke server.');
    } finally {
      setLoading(false);
    }
  };

  if (successOrder) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="max-w-lg mx-auto bg-white border border-slate-200 rounded-3xl p-8 text-center shadow-xl shadow-slate-200/50">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={48} />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Transaksi Checkout Berhasil! 🎉</h2>
          <p className="text-xs text-slate-500 mb-6 leading-relaxed">
            Pesanan Anda telah diproses oleh database. Stok produk berhasil dipotong secara atomis.
          </p>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left space-y-3 mb-6 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">ID Pesanan:</span>
              <strong className="font-mono text-slate-800">{successOrder.id}</strong>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Status Pembayaran:</span>
              <span className="bg-emerald-50 text-emerald-600 font-bold px-2 py-0.5 rounded-full text-[10px]">
                {successOrder.status}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Total Pembayaran:</span>
              <strong className="text-sm font-extrabold text-indigo-600">
                {formatRupiah(Number(successOrder.totalAmount))}
              </strong>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => router.push('/orders')}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/20"
            >
              Lihat Riwayat Pesanan
            </button>
            <button
              onClick={() => router.push('/')}
              className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold transition-all"
            >
              Kembali ke Katalog
            </button>
          </div>
        </div>
      </div>
    );
  }

  const subtotal = getTotalAmount();
  const tax = subtotal * 0.11;
  const grandTotal = subtotal + tax;

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Lanjut Belanja</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display">
            Keranjang Belanja
          </h1>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-4 bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl text-sm font-semibold mb-6">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {items.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white border border-slate-200 rounded-3xl">
            <ShoppingCart size={48} className="mx-auto text-slate-300 mb-3" />
            <h3 className="text-lg font-bold text-slate-900 mb-1 font-display">Keranjang Belanja Anda Kosong</h3>
            <p className="text-sm text-slate-500 mb-6">Anda belum menambahkan produk apa pun ke dalam keranjang.</p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/20"
            >
              Eksplor Katalog Produk
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Items List */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div
                  key={item.product.id}
                  className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 flex items-center gap-4 sm:gap-6 shadow-xs"
                >
                  <img
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl bg-slate-100 shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1523275335684-37898b6baf30';
                    }}
                  />

                  <div className="flex-grow min-w-0">
                    <h3 className="text-base font-bold text-slate-900 truncate mb-1">
                      {item.product.name}
                    </h3>
                    <div className="text-xs font-semibold text-slate-500 mb-3">
                      {formatRupiah(Number(item.product.price))} / unit
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="inline-flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="px-2.5 py-1 text-slate-600 hover:bg-slate-200 transition-colors"
                          aria-label="Kurangi Kuantitas"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="px-3 text-xs font-bold text-slate-900">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          disabled={item.quantity >= item.product.stock}
                          className="px-2.5 py-1 text-slate-600 hover:bg-slate-200 transition-colors disabled:opacity-40"
                          aria-label="Tambah Kuantitas"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.product.id)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 transition-colors"
                        title="Hapus Produk"
                      >
                        <Trash2 size={15} />
                        <span>Hapus</span>
                      </button>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="block text-[10px] uppercase font-bold text-slate-400">Total</span>
                    <span className="text-base font-extrabold text-slate-900 font-display">
                      {formatRupiah(Number(item.product.price) * item.quantity)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Sidebar Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-md sticky top-24 space-y-6">
                <h2 className="text-lg font-bold text-slate-900 font-display">Ringkasan Pesanan</h2>

                <div className="space-y-3 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Subtotal ({items.length} item)</span>
                    <span className="font-semibold text-slate-900">{formatRupiah(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Estimasi PPN (11%)</span>
                    <span className="font-semibold text-slate-900">{formatRupiah(tax)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pengiriman</span>
                    <span className="font-bold text-emerald-600">GRATIS</span>
                  </div>
                  <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-sm font-bold text-slate-900">
                    <span>Total Tagihan</span>
                    <span className="text-xl font-extrabold text-indigo-600 font-display">
                      {formatRupiah(grandTotal)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={loading || items.length === 0}
                  className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-md shadow-indigo-600/30 transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <span>Memproses Checkout...</span>
                  ) : (
                    <>
                      <CreditCard size={18} />
                      <span>Eksekusi Checkout</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
