import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

/* ── Reducer ──────────────────────────────────────────────────── */
const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD': {
      const existing = state.find(i => i.id === action.payload.id);
      if (existing) {
        return state.map(i =>
          i.id === action.payload.id
            ? { ...i, quantity: i.quantity + (action.payload.quantity || 1) }
            : i
        );
      }
      return [...state, { ...action.payload, quantity: action.payload.quantity || 1 }];
    }
    case 'REMOVE':      return state.filter(i => i.id !== action.payload);
    case 'UPDATE_QTY':  return state.map(i =>
      i.id === action.payload.id ? { ...i, quantity: action.payload.quantity } : i
    );
    case 'CLEAR':       return [];
    case 'HYDRATE':     return action.payload;   // replace whole cart from DB
    default:            return state;
  }
};

/* ── Provider ─────────────────────────────────────────────────── */
export const CartProvider = ({ children }) => {
  const { user } = useAuth();

  const [cart, dispatch] = useReducer(
    cartReducer,
    [],
    () => {
      try { return JSON.parse(localStorage.getItem('cart')) || []; }
      catch { return []; }
    }
  );

  /* Persist to localStorage always */
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  /* ── Sync from Supabase when user logs in ── */
  const syncFromDB = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('cart')
      .select('*, products(id, name, price, image_url, stock)')
      .eq('user_id', user.id);

    if (!error && data?.length > 0) {
      const mapped = data.map(row => ({
        id:        row.products.id,
        name:      row.products.name,
        price:     Number(row.products.price),
        image_url: row.products.image_url,
        stock:     row.products.stock,
        quantity:  row.quantity,
        cart_row:  row.id,           // DB row id for deletion
      }));
      dispatch({ type: 'HYDRATE', payload: mapped });
    }
  }, [user]);

  /* ── Sync local cart → Supabase when user logs in ── */
  const pushLocalToDB = useCallback(async (localCart) => {
    if (!user || localCart.length === 0) return;
    for (const item of localCart) {
      await supabase.from('cart').upsert(
        { user_id: user.id, product_id: item.id, quantity: item.quantity },
        { onConflict: 'user_id,product_id' }
      );
    }
    await syncFromDB();
  }, [user, syncFromDB]);

  useEffect(() => {
    if (user) {
      // Push any local cart items then fetch merged DB state
      pushLocalToDB(cart);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  /* ── Supabase cart helpers ── */
  const dbAddItem = useCallback(async (item, qty = 1) => {
    if (!user) return;
    await supabase.from('cart').upsert(
      { user_id: user.id, product_id: item.id, quantity: qty },
      { onConflict: 'user_id,product_id' }
    );
  }, [user]);

  const dbUpdateQty = useCallback(async (productId, qty) => {
    if (!user) return;
    await supabase.from('cart')
      .update({ quantity: qty })
      .eq('user_id', user.id)
      .eq('product_id', productId);
  }, [user]);

  const dbRemoveItem = useCallback(async (productId) => {
    if (!user) return;
    await supabase.from('cart')
      .delete()
      .eq('user_id', user.id)
      .eq('product_id', productId);
  }, [user]);

  const dbClearCart = useCallback(async () => {
    if (!user) return;
    await supabase.from('cart').delete().eq('user_id', user.id);
  }, [user]);

  /* ── Public actions (local + DB) ── */
  const addItem = (item, qty = 1) => {
    dispatch({ type: 'ADD', payload: { ...item, quantity: qty } });
    dbAddItem(item, qty);
  };

  const removeItem = (id) => {
    dispatch({ type: 'REMOVE', payload: id });
    dbRemoveItem(id);
  };

  const updateQty = (id, qty) => {
    if (qty < 1) { removeItem(id); return; }
    dispatch({ type: 'UPDATE_QTY', payload: { id, quantity: qty } });
    dbUpdateQty(id, qty);
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR' });
    dbClearCart();
    localStorage.removeItem('cart');
  };

  /* ── Derived values ── */
  const totalItems = cart.reduce((s, i) => s + i.quantity, 0);
  const subtotal   = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const shipping   = subtotal > 50 ? 0 : subtotal === 0 ? 0 : 5.99;
  const tax        = subtotal * 0.08;        // 8% tax
  const totalPrice = subtotal + shipping + tax;

  return (
    <CartContext.Provider value={{
      cart, addItem, removeItem, updateQty, clearCart,
      totalItems, subtotal, shipping, tax, totalPrice,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
