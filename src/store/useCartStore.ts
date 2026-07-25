import { create } from 'zustand';
import { trackEcommerceEvent } from '@/lib/analytics';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number | string;
  stock: number;
  imageUrl: string;
  createdAt?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalAmount: () => number;
  getTotalItems: () => number;
}

const loadInitialCart = (): CartItem[] => {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem('prismart_cart');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

const saveCart = (items: CartItem[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('prismart_cart', JSON.stringify(items));
};

export const useCartStore = create<CartState>((set, get) => ({
  items: loadInitialCart(),

  addItem: (product: Product, quantity = 1) => {
    const items = get().items;
    const existingIndex = items.findIndex((item) => item.product.id === product.id);

    let updated: CartItem[];
    if (existingIndex > -1) {
      updated = [...items];
      const newQty = updated[existingIndex].quantity + quantity;
      updated[existingIndex] = {
        ...updated[existingIndex],
        quantity: Math.min(newQty, product.stock),
      };
    } else {
      updated = [...items, { product, quantity: Math.min(quantity, product.stock) }];
    }

    saveCart(updated);
    set({ items: updated });

    trackEcommerceEvent('add_to_cart', {
      currency: 'IDR',
      value: Number(product.price) * quantity,
      items: [
        {
          item_id: product.id,
          item_name: product.name,
          price: Number(product.price),
          quantity,
        },
      ],
    });
  },

  removeItem: (productId: string) => {
    const itemToRemove = get().items.find((item) => item.product.id === productId);
    const updated = get().items.filter((item) => item.product.id !== productId);
    saveCart(updated);
    set({ items: updated });

    if (itemToRemove) {
      trackEcommerceEvent('remove_from_cart', {
        currency: 'IDR',
        value: Number(itemToRemove.product.price) * itemToRemove.quantity,
        items: [
          {
            item_id: itemToRemove.product.id,
            item_name: itemToRemove.product.name,
            price: Number(itemToRemove.product.price),
            quantity: itemToRemove.quantity,
          },
        ],
      });
    }
  },

  updateQuantity: (productId: string, quantity: number) => {
    if (quantity <= 0) {
      get().removeItem(productId);
      return;
    }

    const updated = get().items.map((item) => {
      if (item.product.id === productId) {
        return { ...item, quantity: Math.min(quantity, item.product.stock) };
      }
      return item;
    });

    saveCart(updated);
    set({ items: updated });
  },

  clearCart: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('prismart_cart');
    }
    set({ items: [] });
    trackEcommerceEvent('clear_cart');
  },

  getTotalAmount: () => {
    return get().items.reduce((sum, item) => {
      const price = Number(item.product.price) || 0;
      return sum + price * item.quantity;
    }, 0);
  },

  getTotalItems: () => {
    return get().items.reduce((sum, item) => sum + item.quantity, 0);
  },
}));
