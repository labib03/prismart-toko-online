'use client';

import React, { useState, useEffect } from 'react';
import { X, Star, ShoppingCart, Check, MessageSquare, AlertCircle, Send } from 'lucide-react';
import { Product, useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { apiRequest } from '@/services/api';

export interface ReviewItem {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
  };
}

interface ProductDetailModalProps {
  product: Product & { avgRating?: number; reviewCount?: number } | null;
  onClose: () => void;
  onReviewAdded?: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onReviewAdded,
}) => {
  const { isAuthenticated } = useAuthStore();
  const addItem = useCartStore((state) => state.addItem);

  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [addedCart, setAddedCart] = useState(false);

  // Review Form state
  const [newRating, setNewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewSuccess, setReviewSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!product?.id) return;

    const fetchReviews = async () => {
      setLoadingReviews(true);
      try {
        const res = await apiRequest<{ reviews: ReviewItem[] }>(`/products/${product.id}/reviews`);
        if (res.success && Array.isArray(res.data?.reviews)) {
          setReviews(res.data.reviews);
        }
      } catch (err: any) {
        console.error('Failed to fetch reviews:', err);
      } finally {
        setLoadingReviews(false);
      }
    };

    fetchReviews();
  }, [product?.id]);

  if (!product) return null;

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
      month: 'short',
      year: 'numeric',
    });
  };

  const handleAddToCart = () => {
    if (product.stock <= 0) return;
    addItem(product, 1);
    setAddedCart(true);
    setTimeout(() => setAddedCart(false), 1500);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) {
      setReviewError('Silakan tuliskan komentar ulasan Anda.');
      return;
    }

    setSubmittingReview(true);
    setReviewError(null);
    setReviewSuccess(null);

    try {
      const res = await apiRequest<{ review: ReviewItem }>(`/products/${product.id}/reviews`, {
        method: 'POST',
        body: JSON.stringify({
          rating: newRating,
          comment: newComment,
        }),
      });

      if (res.success && res.data?.review) {
        setReviewSuccess('Ulasan Anda berhasil dikirim!');
        setNewComment('');
        setNewRating(5);
        setReviews([res.data.review, ...reviews]);
        if (onReviewAdded) onReviewAdded();
      } else {
        setReviewError(res.message || 'Gagal mengirim ulasan');
      }
    } catch (err: any) {
      setReviewError(err.message || 'Terjadi kesalahan koneksi server.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : product.avgRating || 0;

  const isOutOfStock = product.stock <= 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div
        className="bg-white border border-slate-200 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <span className="bg-indigo-50 text-indigo-600 text-xs font-bold px-2.5 py-1 rounded-full border border-indigo-100">
              Detail & Ulasan Produk
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
            title="Tutup Modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-8">
          {/* Main Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Image */}
            <div className="relative aspect-[4/3] bg-slate-100 rounded-2xl overflow-hidden border border-slate-200/80">
              <img
                src={product.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30'}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1523275335684-37898b6baf30';
                }}
              />
            </div>

            {/* Product Meta */}
            <div className="flex flex-col justify-between">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 mb-2 tracking-tight">
                  {product.name}
                </h2>

                {/* Rating Badge */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center text-amber-400">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={16}
                        fill={star <= Math.round(Number(avgRating)) ? 'currentColor' : 'none'}
                        className={star <= Math.round(Number(avgRating)) ? 'text-amber-400' : 'text-slate-200'}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-slate-800">{avgRating}</span>
                  <span className="text-xs text-slate-400">({reviews.length} ulasan)</span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  {product.description || 'Tidak ada deskripsi rinci.'}
                </p>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-semibold">Harga:</span>
                  <span className="text-2xl font-extrabold text-indigo-600">
                    {formatRupiah(product.price)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-semibold">Ketersediaan Stock:</span>
                  <span
                    className={`font-bold px-2.5 py-0.5 rounded-full text-xs ${
                      isOutOfStock
                        ? 'bg-rose-50 text-rose-600 border border-rose-200'
                        : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                    }`}
                  >
                    {isOutOfStock ? 'Stok Habis' : `${product.stock} unit tersedia`}
                  </span>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className={`w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md ${
                    addedCart
                      ? 'bg-emerald-600 text-white shadow-emerald-600/20'
                      : isOutOfStock
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/25'
                  }`}
                >
                  {addedCart ? (
                    <>
                      <Check size={18} />
                      <span>Berhasil Ditambahkan ke Keranjang</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={18} />
                      <span>+ Tambah ke Keranjang Belanja</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Review Section */}
          <div className="pt-6 border-t border-slate-100 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <MessageSquare size={18} className="text-indigo-600" />
                <span>Ulasan & Rating Pembeli</span>
              </h3>
              <span className="text-xs font-semibold text-slate-500">
                Total {reviews.length} Ulasan
              </span>
            </div>

            {/* Form Write Review */}
            {isAuthenticated ? (
              <form onSubmit={handleSubmitReview} className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3">
                <h4 className="text-xs font-bold text-slate-800">Tulis Ulasan Anda</h4>

                {reviewError && (
                  <div className="flex items-center gap-1.5 p-2.5 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-xs font-semibold">
                    <AlertCircle size={16} />
                    <span>{reviewError}</span>
                  </div>
                )}

                {reviewSuccess && (
                  <div className="flex items-center gap-1.5 p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-xl text-xs font-semibold">
                    <Check size={16} />
                    <span>{reviewSuccess}</span>
                  </div>
                )}

                {/* Rating Picker */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-600">Pilih Rating:</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 focus:outline-none transition-transform hover:scale-110"
                      >
                        <Star
                          size={20}
                          fill={star <= (hoverRating || newRating) ? 'currentColor' : 'none'}
                          className={
                            star <= (hoverRating || newRating)
                              ? 'text-amber-400'
                              : 'text-slate-300'
                          }
                        />
                      </button>
                    ))}
                  </div>
                  <span className="text-xs font-bold text-amber-500">
                    {hoverRating || newRating} / 5 Bintang
                  </span>
                </div>

                <textarea
                  placeholder="Bagikan pengalaman Anda menggunakan produk ini..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 resize-none"
                  rows={2}
                  required
                ></textarea>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors disabled:opacity-50"
                  >
                    <Send size={14} />
                    <span>{submittingReview ? 'Mengirim...' : 'Kirim Ulasan'}</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl text-center text-xs text-slate-600">
                Silakan <strong>Masuk ke akun Anda</strong> untuk menulis ulasan produk.
              </div>
            )}

            {/* Reviews List */}
            {loadingReviews ? (
              <div className="py-6 text-center text-xs text-slate-400">
                Memuat ulasan pembeli...
              </div>
            ) : reviews.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                Belum ada ulasan untuk produk ini. Jadilah yang pertama memberikan ulasan!
              </div>
            ) : (
              <div className="space-y-3">
                {reviews.map((rev) => (
                  <div key={rev.id} className="p-4 bg-white border border-slate-100 rounded-2xl shadow-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">
                          {rev.user?.name ? rev.user.name[0].toUpperCase() : 'U'}
                        </div>
                        <div>
                          <span className="block text-xs font-bold text-slate-900">
                            {rev.user?.name || 'Pengguna'}
                          </span>
                          <span className="block text-[10px] text-slate-400">
                            {formatDate(rev.createdAt)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center text-amber-400">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={14}
                            fill={star <= rev.rating ? 'currentColor' : 'none'}
                            className={star <= rev.rating ? 'text-amber-400' : 'text-slate-200'}
                          />
                        ))}
                      </div>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed">{rev.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
