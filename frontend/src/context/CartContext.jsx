import { CheckCircle2 } from "lucide-react";
import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "cc_cart";

function loadCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart);
  const [toast, setToast] = useState(null);
  const toastTimeout = useRef(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  function addItem({ item, service, price }) {
    const key = `${item}__${service}`;
    setItems((prev) => {
      const existing = prev.find((l) => l.key === key);
      if (existing) {
        return prev.map((l) => (l.key === key ? { ...l, qty: l.qty + 1 } : l));
      }
      return [...prev, { key, item, service, price, qty: 1 }];
    });

    setToast(`${item} added to cart`);
    clearTimeout(toastTimeout.current);
    toastTimeout.current = setTimeout(() => setToast(null), 2200);
  }

  function updateQty(key, qty) {
    if (qty < 1) return removeItem(key);
    setItems((prev) => prev.map((l) => (l.key === key ? { ...l, qty } : l)));
  }

  function removeItem(key) {
    setItems((prev) => prev.filter((l) => l.key !== key));
  }

  function clearCart() {
    setItems([]);
  }

  const total = useMemo(() => items.reduce((sum, l) => sum + l.price * l.qty, 0), [items]);
  const count = useMemo(() => items.reduce((sum, l) => sum + l.qty, 0), [items]);

  return (
    <CartContext.Provider value={{ items, addItem, updateQty, removeItem, clearCart, total, count }}>
      {children}
      {toast && (
        <div className="pointer-events-none fixed inset-x-0 bottom-20 z-[70] flex justify-center px-4 lg:bottom-6">
          <div className="flex items-center gap-2 rounded-pill bg-ink px-4 py-2.5 text-sm font-medium text-white shadow-lg">
            <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-lime" />
            {toast}
          </div>
        </div>
      )}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
