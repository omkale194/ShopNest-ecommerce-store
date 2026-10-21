import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CartApi } from "../api";
import { apiError } from "../api/client";
import { useAuth } from "./AuthContext";
import { useToast } from "./ToastContext";

const CartContext = createContext(null);

const EMPTY = { items: [], itemCount: 0, subtotal: 0 };

export function CartProvider({ children }) {
  const { user, ready } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [cart, setCart] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  // Counts successful additions so the header badge can play a short bump.
  const [bump, setBump] = useState(0);

  const refresh = useCallback(async () => {
    if (!user) {
      setCart(EMPTY);
      return;
    }
    setLoading(true);
    try {
      setCart(await CartApi.get());
    } catch {
      /* keep the last known cart */
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (ready) refresh();
  }, [ready, refresh]);

  const run = useCallback(
    async (action, okMessage) => {
      try {
        setCart(await action());
        if (okMessage) toast.success(okMessage);
        return true;
      } catch (err) {
        toast.error(apiError(err).message);
        return false;
      }
    },
    [toast]
  );

  const add = useCallback(
    async (productId, quantity = 1) => {
      if (!user) {
        toast.info("Log in to add items to your cart");
        navigate("/login", { state: { from: location.pathname + location.search } });
        return false;
      }
      const ok = await run(() => CartApi.add(productId, quantity), "Added to cart");
      if (ok) setBump((b) => b + 1);
      return ok;
    },
    [user, run, toast, navigate, location]
  );

  const update = useCallback((itemId, quantity) => run(() => CartApi.update(itemId, quantity)), [run]);
  const remove = useCallback((itemId) => run(() => CartApi.remove(itemId), "Removed from cart"), [run]);
  const clear = useCallback(() => run(() => CartApi.clear(), "Cart emptied"), [run]);

  const value = useMemo(
    () => ({ cart, loading, bump, add, update, remove, clear, refresh }),
    [cart, loading, bump, add, update, remove, clear, refresh]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  return useContext(CartContext);
}
