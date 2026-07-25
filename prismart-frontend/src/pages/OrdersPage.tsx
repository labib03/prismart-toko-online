import React, { useState, useEffect } from 'react';
import { ShoppingBag, Calendar, AlertCircle } from 'lucide-react';
import { apiRequest } from '../services/api';

interface OrderItem {
  id: string;
  quantity: number;
  price: number | string;
  product: {
    name: string;
    imageUrl: string;
  };
}

interface Order {
  id: string;
  totalAmount: number | string;
  status: string;
  createdAt: string;
  orderItems: OrderItem[];
}

export const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formatRupiah = (val: number | string) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(Number(val));
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await apiRequest<Order[]>('/orders');
        if (res.success && Array.isArray(res.data)) {
          setOrders(res.data);
        } else {
          setError(res.message || 'Gagal mengambil riwayat pesanan');
        }
      } catch (err: any) {
        setError(err.message || 'Gagal terhubung ke server.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-1">
          Riwayat Pesanan Saya
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Daftar transaksi checkout yang pernah dilakukan di akun ini.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl text-sm font-semibold mb-6">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-500">
          <div className="w-8 h-8 border-3 border-slate-200 border-t-indigo-600 rounded-full animate-spin-custom mb-3"></div>
          <p className="text-xs font-semibold">Memuat riwayat pesanan...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white border border-slate-200 rounded-3xl">
          <ShoppingBag size={48} className="mx-auto text-slate-300 mb-3" />
          <h3 className="text-lg font-bold text-slate-900 mb-1">Belum Ada Transaksi</h3>
          <p className="text-sm text-slate-500">Anda belum pernah melakukan checkout pesanan.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
              {/* Header */}
              <div className="bg-slate-50 border-b border-slate-200/80 px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-4 text-slate-600">
                  <span>ID: <strong className="font-mono text-slate-900">{order.id}</strong></span>
                  <span className="flex items-center gap-1">
                    <Calendar size={14} className="text-slate-400" />
                    {formatDate(order.createdAt)}
                  </span>
                </div>
                <span className="bg-emerald-50 text-emerald-600 border border-emerald-200 font-bold px-2.5 py-0.5 rounded-full text-[11px]">
                  {order.status}
                </span>
              </div>

              {/* Items */}
              <div className="p-6 space-y-4">
                {order.orderItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-4">
                    <img
                      src={item.product?.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30'}
                      alt={item.product?.name}
                      className="w-12 h-12 object-cover rounded-xl bg-slate-100 shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1523275335684-37898b6baf30';
                      }}
                    />
                    <div className="flex-grow min-w-0">
                      <h4 className="text-sm font-bold text-slate-900 truncate">{item.product?.name || 'Produk'}</h4>
                      <span className="text-xs text-slate-500">
                        {item.quantity} x {formatRupiah(item.price)}
                      </span>
                    </div>
                    <div className="text-sm font-extrabold text-slate-900">
                      {formatRupiah(Number(item.price) * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="bg-slate-50 border-t border-slate-200/80 px-6 py-3.5 flex justify-end items-center gap-3 text-sm">
                <span className="text-xs font-semibold text-slate-500">Total Pesanan:</span>
                <span className="text-base font-extrabold text-indigo-600">{formatRupiah(order.totalAmount)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
