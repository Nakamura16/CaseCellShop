import { useEffect, useState } from "react";
import { ProductApi } from "../Api/products-api";
import { Product } from "../Model/product";
import "./ProductsPage.css";

const productApi = new ProductApi();

function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProducts() {
      try {
        const products = await productApi.getProducts();
        setProducts(products);
      } catch (error) {
        setError("Não foi possível carregar os produtos. Tente novamente.");
        console.error("Erro ao carregar os produtos:", error);
      }
    }

    loadProducts();
  }, []);

  if (error) {
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
      <header className="store-header">
        <div className="brand">
          <span className="brand-icon">C</span>
          <span>CaseCell</span>
        </div>

        <div className="cart">
          🛒
          <span className="cart-badge">0</span>
        </div>
      </header>

      <section className="hero">
        <div>
          <span className="hero-tag">PROTEÇÃO & ESTILO</span>

          <h1>
            Sua capa.
            <br />
            Seu estilo.
          </h1>

          <p>
            Capinhas premium para proteger seu smartphone sem abrir mão do
            estilo.
          </p>
        </div>
      </section>

      <section className="products-section">
        <div className="section-header">
          <div>
            <span className="section-label">COLEÇÃO</span>
            <h2>Escolha sua capinha</h2>
          </div>

          <span className="product-count">{products.length} produtos</span>
        </div>

        <div className="products-grid">
          {products.map((product) => (
            <article className="product-card" key={product.id}>
              <div className="product-image">
                <div className="phone-placeholder">
                  <span>◈</span>
                </div>
              </div>

              <div className="product-content">
                <span className="product-category">SMARTPHONE</span>

                <h3>{product.name}</h3>

                <p className="product-description">{product.description}</p>

                <div className="product-footer">
                  <div>
                    <span className="price-label">POR</span>

                    <strong className="product-price">
                      R$ {product.price.toFixed(2).replace(".", ",")}
                    </strong>
                  </div>

                  <span
                    className={`stock ${
                      product.stock === 0
                        ? "out-of-stock"
                        : product.stock <= 3
                          ? "low-stock"
                          : ""
                    }`}
                  >
                    {product.stock === 0
                      ? "Esgotado"
                      : `${product.stock} disponíveis`}
                  </span>
                </div>

                <button className="buy-button" disabled={product.stock === 0}>
                  {product.stock === 0 ? "Produto esgotado" : "Comprar agora"}
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

export default ProductsPage;
