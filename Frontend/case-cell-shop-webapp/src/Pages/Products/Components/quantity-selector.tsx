interface QuantitySelectorProps {
  quantity: number;
  min?: number;
  max: number;
  disabled?: boolean;
  onIncrease: () => void;
  onDecrease: () => void;
}

function QuantitySelector({
  quantity,
  min = 1,
  max,
  disabled = false,
  onIncrease,
  onDecrease,
}: QuantitySelectorProps) {
  return (
    <div className="quantity-selector">
      <button onClick={onDecrease} disabled={disabled || quantity <= min}>
        −
      </button>

      <span>{quantity}</span>

      <button onClick={onIncrease} disabled={disabled || quantity >= max}>
        +
      </button>
    </div>
  );
}

export default QuantitySelector;
