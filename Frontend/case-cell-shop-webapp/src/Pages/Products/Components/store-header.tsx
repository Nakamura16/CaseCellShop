function StoreHeader() {
  return (
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
  );
}

export default StoreHeader;
