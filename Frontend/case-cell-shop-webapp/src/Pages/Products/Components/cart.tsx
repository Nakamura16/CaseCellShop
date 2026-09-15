import { useCart } from "../../../Context/CartContext";

interface CartProps {
  onClose: () => void;
}

function Cart({ onClose }: CartProps) {
  const { items, total, increaseQuantity, decreaseQuantity, removeItem } =
    useCart();

  return (
    <aside className="cart-panel">
      <div className="cart-header">
        <div>
          <span className="section-label">SEU PEDIDO</span>
          <h2>Carrinho</h2>
        </div>

        <button className="cart-close" onClick={onClose}>
          ×
        </button>
      </div>

      {items.length === 0 ? (
        <div className="cart-empty">
          <span className="cart-empty-icon">🛒</span>

          <h3>Seu carrinho está vazio</h3>

          <p>Adicione algumas capinhas para continuar.</p>
        </div>
      ) : (
        <>
          <div className="cart-items">
            {items.map((item) => (
              <div className="cart-item" key={item.product.id}>
                <div className="cart-item-image">
                  <div className="phone-placeholder small">
                    <span>◈</span>
                  </div>
                </div>

                <div className="cart-item-content">
                  <div className="cart-item-info">
                    <h3>{item.product.name}</h3>

                    <span>
                      R$ {item.product.price.toFixed(2).replace(".", ",")}
                    </span>
                  </div>

                  <div className="cart-item-actions">
                    <div className="quantity-selector">
                      <button onClick={() => decreaseQuantity(item.product.id)}>
                        −
                      </button>

                      <span>{item.quantity}</span>

                      <button
                        onClick={() => increaseQuantity(item.product.id)}
                        disabled={item.quantity >= item.product.stock}
                      >
                        +
                      </button>
                    </div>

                    <button
                      className="remove-item"
                      onClick={() => removeItem(item.product.id)}
                    >
                      Remover
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-footer">
            <div className="cart-total">
              <span>Total</span>

              <strong>R$ {total.toFixed(2).replace(".", ",")}</strong>
            </div>

            <button className="checkout-button">Ir para checkout</button>
          </div>
        </>
      )}
    </aside>
  );
}

export default Cart;
