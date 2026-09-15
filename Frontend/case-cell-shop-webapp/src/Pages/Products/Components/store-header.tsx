import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../../Context/AuthContext";
import { useCart } from "../../../Context/CartContext";

import Cart from "./cart";

function StoreHeader() {
  const [isCartOpen, setIsCartOpen] = useState(false);

  const { itemCount } = useCart();
  const { isAuthenticated, session } = useAuth();

  const navigate = useNavigate();

  useEffect(() => {
    if (itemCount > 0) {
      setIsCartOpen(true);
    }
  }, [itemCount]);

  function handleAuthentication() {
    if (isAuthenticated) {
      return;
    }

    navigate("/login");
  }

  return (
    <>
      <header className="store-header">
        <div className="brand">
          <span className="brand-icon">C</span>
          <span>CaseCell</span>
        </div>

        <div className="store-header-actions">
          <button className="login-button" onClick={handleAuthentication}>
            {isAuthenticated ? `Olá, ${session?.user.name}` : "Entrar"}
          </button>

          <button className="cart" onClick={() => setIsCartOpen(true)}>
            🛒
            {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
          </button>
        </div>
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
