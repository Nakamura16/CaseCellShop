import { useEffect, useState } from "react";

import { ProductApi } from "../../Api/products-api";
import { OrderApi } from "../../Api/order-api";
import { Product } from "../../Model/product";

import StoreHeader from "./Components/store-header";
import StoreBanner from "./Components/store-banner";
import ProductCard from "./Components/product-card";

import "./ProductsPage.css";

const productApi = new ProductApi();
const orderApi = new OrderApi();

function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const [purchasingProductId, setPurchasingProductId] = useState<string | null>(
    null,
  );

  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadProducts() {
      try {
        const products = await productApi.getProducts();
        setProducts(products);
      } catch {
        setError("Não foi possível carregar os produtos. Tente novamente.");
      }
    }

    loadProducts();
  }, []);

  function getQuantity(productId: string) {
    return quantities[productId] ?? 1;
  }

  function increaseQuantity(product: Product) {
    const currentQuantity = getQuantity(product.id);

    if (currentQuantity >= product.stock) {
      return;
    }

    setQuantities((current) => ({
      ...current,
      [product.id]: currentQuantity + 1,
    }));
  }

  function decreaseQuantity(productId: string) {
    const currentQuantity = getQuantity(productId);

    if (currentQuantity <= 1) {
      return;
    }

    setQuantities((current) => ({
      ...current,
      [productId]: currentQuantity - 1,
    }));
  }

  async function handlePurchase(product: Product) {
    const quantity = getQuantity(product.id);

    setPurchasingProductId(product.id);
    setError(null);
    setSuccessMessage(null);

    try {
      const order = await orderApi.createOrder({
        productId: product.id,
        quantity,
      });

      setSuccessMessage(`Compra realizada com sucesso! Pedido #${order.id}`);

      setProducts((currentProducts) =>
        currentProducts.map((currentProduct) =>
          currentProduct.id === product.id
            ? {
                ...currentProduct,
                stock: currentProduct.stock - quantity,
              }
            : currentProduct,
        ),
      );

      setQuantities((current) => ({
        ...current,
        [product.id]: 1,
      }));
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Não foi possível realizar a compra.",
      );
    } finally {
      setPurchasingProductId(null);
    }
  }

  if (error && products.length === 0) {
    return (
      <main className="products-page">
        <div className="error-state">
          <span className="error-icon">!</span>

          <h2>Ops! Algo deu errado</h2>

          <p>{error}</p>

          <button
            className="primary-button"
            onClick={() => window.location.reload()}
          >
            Tentar novamente
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="products-page">
      <StoreHeader />

      <StoreBanner />

      <section className="products-section">
        <div className="section-header">
          <div>
            <span className="section-label">COLEÇÃO</span>

            <h2>Escolha sua capinha</h2>
          </div>

          <span className="product-count">{products.length} produtos</span>
        </div>

        {successMessage && (
          <div className="success-message">✓ {successMessage}</div>
        )}

        {error && <div className="purchase-error">{error}</div>}

        <div className="products-grid">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              quantity={getQuantity(product.id)}
              isPurchasing={purchasingProductId === product.id}
              onIncreaseQuantity={() => increaseQuantity(product)}
              onDecreaseQuantity={() => decreaseQuantity(product.id)}
              onPurchase={() => handlePurchase(product)}
            />
          ))}
        </div>
      </section>
    </main>
  );
}

export default ProductsPage;
