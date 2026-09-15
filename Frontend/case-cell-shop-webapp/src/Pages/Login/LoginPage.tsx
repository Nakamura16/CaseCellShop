import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../Context/AuthContext";

import "./LoginPage.css";

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError(null);
    setLoading(true);

    try {
      await login({
        email,
        password,
      });

      navigate("/products");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Não foi possível realizar o login.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <div className="login-card">
        <span className="section-label">CASECELL</span>

        <h1>Entrar</h1>

        <p>Entre para continuar com seu pedido.</p>

        <div className="login-test-tooltip">
          <strong>Usuário de teste</strong>

          <span>Teste da Silva</span>
          <span>teste@casecell.com</span>
          <span>Senha: 123456</span>
        </div>

        <form onSubmit={handleSubmit}>
          <label>
            E-mail
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="teste@casecell.com"
              disabled={loading}
            />
          </label>

          <label>
            Senha
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="123456"
              disabled={loading}
            />
          </label>

          {error && <div className="login-error">{error}</div>}

          <button type="submit" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </main>
  );
}

export default LoginPage;
