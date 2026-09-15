import { useEffect, useState } from "react";

import { OrderApi } from "../../Api/order-api";
import { Order } from "../../Model/order";

import "./orders-page.css";

const orderApi = new OrderApi();

function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadOrders() {
      try {
        const result = await orderApi.getOrders();

        setOrders(result);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Não foi possível carregar os pedidos.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, []);

  if (loading) {
    return (
      <main className="orders-page">
        <div className="orders-state">
          <p>Carregando pedidos...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="orders-page">
        <div className="orders-state">
          <h1>Ops!</h1>
          <p>{error}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="orders-page">
      <header className="orders-header">
        <span className="section-label">CASECELL</span>

        <h1>Meus pedidos</h1>

        <p>Confira os pedidos realizados na loja.</p>
      </header>

      {orders.length === 0 ? (
        <div className="orders-empty">
          <span>🛍️</span>

          <h2>Nenhum pedido encontrado</h2>

          <p>Você ainda não realizou nenhum pedido.</p>
        </div>
      ) : (
        <section className="orders-list">
          {orders.map((order) => (
            <article className="order-card" key={order.id}>
              <div className="order-card-header">
                <div>
                  <span className="order-label">PEDIDO</span>

                  <strong>#{order.id.slice(0, 8)}</strong>
                </div>

                <span className={`order-status ${order.status.toLowerCase()}`}>
                  {order.status}
                </span>
              </div>

              <div className="order-card-content">
                <div>
                  <span>Total</span>

                  <strong>
                    R$ {order.totalAmount.toFixed(2).replace(".", ",")}
                  </strong>
                </div>

                <div>
                  <span>Data</span>

                  <strong>
                    {new Date(order.createdAt).toLocaleDateString("pt-BR")}
                  </strong>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}

export default OrdersPage;
