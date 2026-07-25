/* Hallmark · genre: modern-minimal · macrostructure: Marquee Hero · design-system: design.md · designed-as-app */
import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, ShoppingCart, User as UserIcon, Shield, LogOut, Package } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useCartStore } from '../store/useCartStore';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuthStore();
  const totalCartItems = useCartStore((state) => state.getTotalItems());
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="glass-navbar border-b border-slate-200/80 sticky top-0 z-50 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl brand-gradient flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200">
            <ShoppingBag size={20} className="text-white" />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-slate-900 font-display">
            Prismart
          </span>
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            to="/"
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 active:scale-[0.98] ${
              isActive('/')
                ? 'text-indigo-600 bg-indigo-50/90'
                : 'text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/50'
            }`}
          >
            <Package size={17} />
            <span className="hidden sm:inline">Katalog</span>
          </Link>

          {isAuthenticated && (
            <Link
              to="/orders"
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 active:scale-[0.98] ${
                isActive('/orders')
                  ? 'text-indigo-600 bg-indigo-50/90'
                  : 'text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/50'
              }`}
            >
              <ShoppingBag size={17} />
              <span className="hidden sm:inline">Pesanan Saya</span>
            </Link>
          )}

          {isAdmin && (
            <Link
              to="/admin/products"
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 active:scale-[0.98] ${
                isActive('/admin/products')
                  ? 'text-purple-600 bg-purple-50 border border-purple-200/60'
                  : 'text-purple-700 bg-purple-50/60 hover:bg-purple-50'
              }`}
            >
              <Shield size={17} />
              <span>Admin Panel</span>
            </Link>
          )}
        </nav>

        {/* User & Cart Actions */}
        <div className="flex items-center gap-3">
          <Link
            to="/cart"
            className="relative w-10 h-10 rounded-xl bg-slate-100/80 border border-slate-200 flex items-center justify-center text-slate-700 hover:border-indigo-500 hover:text-indigo-600 transition-all duration-200 active:scale-[0.98]"
            aria-label="Keranjang Belanja"
          >
            <ShoppingCart size={18} />
            {totalCartItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-indigo-600 text-white text-[11px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center shadow-sm shadow-indigo-500/50">
                {totalCartItems}
              </span>
            )}
          </Link>

          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link
                to="/profile"
                className={`flex items-center gap-2 px-3 py-1.5 border rounded-xl text-xs font-bold transition-all duration-200 active:scale-[0.98] ${
                  isActive('/profile')
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                    : 'bg-slate-100/80 border-slate-200 text-slate-800 hover:bg-slate-200/80 hover:border-slate-300'
                }`}
                title="Lihat & Edit Profil"
              >
                <UserIcon size={14} className="text-slate-500" />
                <span className="max-w-[100px] sm:max-w-[140px] truncate">{user?.name}</span>
                {isAdmin && (
                  <span className="bg-purple-600 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                    Admin
                  </span>
                )}
              </Link>

              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold transition-colors duration-200 active:scale-[0.98]"
                title="Keluar dari Akun"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 transition-all duration-200 active:scale-[0.98]"
              >
                Masuk
              </Link>
              <Link
                to="/register"
                className="px-3.5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm shadow-indigo-600/30 transition-all duration-200 active:scale-[0.98]"
              >
                Daftar
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
