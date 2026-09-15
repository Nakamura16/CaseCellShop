import { Product } from "../../../Model/product";
import QuantitySelector from "./quantity-selector";

interface ProductCardProps {
  product: Product;
  quantity: number;
  isPurchasing: boolean;
  onIncreaseQuantity: () => void;
  onDecreaseQuantity: () => void;
  onPurchase: () => void;
}

function ProductCard({
  product,
  quantity,
  isPurchasing,
  onIncreaseQuantity,
  onDecreaseQuantity,
  onPurchase,
}: ProductCardProps) {
  const isOutOfStock = product.stock === 0;

  return (
    <article className="product-card">
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
              isOutOfStock
                ? "out-of-stock"
                : product.stock <= 3
                  ? "low-stock"
                  : ""
            }`}
          >
            {isOutOfStock ? "Esgotado" : `${product.stock} disponíveis`}
          </span>
        </div>

        {!isOutOfStock && (
          <>
            <QuantitySelector
              quantity={quantity}
              max={product.stock}
              disabled={isPurchasing}
              onIncrease={onIncreaseQuantity}
              onDecrease={onDecreaseQuantity}
            />

            <button
              className="buy-button"
              disabled={isPurchasing}
              onClick={onPurchase}
            >
              {isPurchasing ? "Processando..." : "Comprar agora"}
            </button>
          </>
        )}

        {isOutOfStock && (
          <button className="buy-button" disabled>
            Produto esgotado
          </button>
        )}
      </div>
    </article>
  );
}

export default ProductCard;
