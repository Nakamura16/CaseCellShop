import { Product } from "../../../Model/product";
import { useCart } from "../../../Context/CartContext";
import QuantitySelector from "./quantity-selector";

interface ProductCardProps {
  product: Product;
  quantity: number;
  onIncreaseQuantity: () => void;
  onDecreaseQuantity: () => void;
}

function ProductCard({
  product,
  quantity,
  onIncreaseQuantity,
  onDecreaseQuantity,
}: ProductCardProps) {
  const isOutOfStock = product.stock === 0;

  const { addItem } = useCart();

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
              onIncrease={onIncreaseQuantity}
              onDecrease={onDecreaseQuantity}
            />

            <button
              className="buy-button"
              onClick={() => addItem(product, quantity)}
            >
              Adicionar ao carrinho
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
