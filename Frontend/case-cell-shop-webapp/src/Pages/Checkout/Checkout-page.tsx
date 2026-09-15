import { useNavigate } from "react-router-dom";

import { useAuth } from "../../Context/AuthContext";
import { useCart } from "../../Context/CartContext";
import { OrderApi } from "../../Api/order-api";

import "./checkout-page.css";

function CheckoutPage() {
  const { items, total, increaseQuantity, decreaseQuantity, removeItem } =
    useCart();

  const { isAuthenticated } = useAuth();

  const navigate = useNavigate();
  const orderApi = new OrderApi();

  async function handleFinishOrder() {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    try {
      for (const item of items) {
        await orderApi.createOrder({
          productId: item.product.id,
          quantity: item.quantity,
        });
      }

      alert("Pedido realizado com sucesso!");
      navigate("/orders");
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Não foi possível realizar o pedido.",
      );
    }
  }

  if (items.length === 0) {
    return (
      <main className="checkout-page">
        <div className="checkout-empty">
          <span>🛒</span>

          <h1>Seu carrinho está vazio</h1>

          <p>Adicione algum produto antes de continuar.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="checkout-page">
      <header className="checkout-header">
        <div>
          <span className="section-label">CHECKOUT</span>

          <h1>Finalizar pedido</h1>
        </div>
      </header>

      <div className="checkout-content">
        <section className="checkout-items">
          <h2>Seu pedido</h2>

          {items.map((item) => (
            <article className="checkout-item" key={item.product.id}>
              <div className="checkout-item-image">
                <div className="phone-placeholder small">
                  <span>◈</span>
                </div>
              </div>

              <div className="checkout-item-info">
                <h3>{item.product.name}</h3>

                <span>
                  R$ {item.product.price.toFixed(2).replace(".", ",")}
                </span>

                <div className="checkout-item-actions">
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

              <strong>
                R${" "}
                {(item.product.price * item.quantity)
                  .toFixed(2)
                  .replace(".", ",")}
              </strong>
            </article>
          ))}
        </section>

        <aside className="checkout-summary">
          <span className="section-label">RESUMO</span>

          <h2>Seu pedido</h2>

          <div className="summary-row">
            <span>Subtotal</span>

            <span>R$ {total.toFixed(2).replace(".", ",")}</span>
          </div>

          <div className="summary-row">
            <span>Frete</span>

            <span>Grátis</span>
          </div>

          <div className="summary-divider" />

          <div className="summary-total">
            <span>Total</span>

            <strong>R$ {total.toFixed(2).replace(".", ",")}</strong>
          </div>

          <button className="checkout-submit" onClick={handleFinishOrder}>
            Finalizar compra
          </button>
        </aside>
      </div>
    </main>
  );
}

export default CheckoutPage;
