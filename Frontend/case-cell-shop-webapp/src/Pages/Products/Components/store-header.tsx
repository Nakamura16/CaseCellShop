import { useEffect, useState } from "react";

import { useCart } from "../../../Context/CartContext";

import Cart from "./cart";

function StoreHeader() {
  const [isCartOpen, setIsCartOpen] = useState(false);

  const { itemCount } = useCart();

  useEffect(() => {
    if (itemCount > 0) {
      setIsCartOpen(true);
    }
  }, [itemCount]);

  return (
    <>
      <header className="store-header">
        <div className="brand">
          <span className="brand-icon">C</span>
          <span>CaseCell</span>
        </div>

        <button className="cart" onClick={() => setIsCartOpen(true)}>
          🛒
          {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
        </button>
      </header>

      {isCartOpen && (
        <>
          <div className="cart-overlay" onClick={() => setIsCartOpen(false)} />

          <Cart onClose={() => setIsCartOpen(false)} />
        </>
      )}
    </>
  );
}

export default StoreHeader;
