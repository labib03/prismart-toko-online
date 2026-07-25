import React, { useState } from 'react';
import { ShoppingCart, Check } from 'lucide-react';
import { Product, useCartStore } from '../store/useCartStore';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const addItem = useCartStore((state) => state.addItem);
  const [added, setAdded] = useState(false);

  const formatRupiah = (val: number | string) => {
    const num = Number(val) || 0;
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(num);
  };

  const handleAddToCart = () => {
    if (product.stock <= 0) return;
    addItem(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 3;

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden flex flex-col shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 group">
      {/* Image & Stock Badge */}
      <div className="relative w-full aspect-4/3 bg-slate-100 overflow-hidden">
        <img
          src={product.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1523275335684-37898b6baf30';
          }}
        />
        <div className="absolute top-3 right-3">
          {isOutOfStock ? (
            <span className="bg-rose-50 text-rose-600 border border-rose-200 text-xs font-bold px-2.5 py-1 rounded-full shadow-xs">
              Stok Habis
            </span>
          ) : isLowStock ? (
            <span className="bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold px-2.5 py-1 rounded-full shadow-xs">
              Sisa {product.stock}
            </span>
          ) : (
            <span className="bg-white/90 backdrop-blur-xs text-slate-800 border border-slate-200 text-xs font-bold px-2.5 py-1 rounded-full shadow-xs">
              Stok: {product.stock}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1 mb-1">
          {product.name}
        </h3>
        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
          {product.description || 'Tidak ada deskripsi produk.'}
        </p>

        {/* Footer */}
        <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="text-base font-extrabold text-indigo-600">
            {formatRupiah(product.price)}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
              added
                ? 'bg-emerald-600 text-white'
                : isOutOfStock
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white'
            }`}
          >
            {added ? (
              <>
                <Check size={15} />
                <span>Ditambahkan</span>
              </>
            ) : (
              <>
                <ShoppingCart size={15} />
                <span>+ Keranjang</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
