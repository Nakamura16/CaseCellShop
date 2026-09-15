import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import ProductsPage from "../src/Pages/Products/products-page";
import CheckoutPage from "../src/Pages/Checkout/Checkout-page";
import LoginPage from "./Pages/Login/LoginPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/products" element={<ProductsPage />} />

        <Route path="/checkout" element={<CheckoutPage />} />

        <Route path="*" element={<Navigate to="/products" replace />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
