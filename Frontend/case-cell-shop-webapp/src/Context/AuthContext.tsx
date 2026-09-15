import { createContext, ReactNode, useContext, useState } from "react";

import { AuthApi, LoginRequest } from "../Api/auth-api";
import { AuthSession } from "../Model/auth";

interface AuthContextData {
  session: AuthSession | null;
  isAuthenticated: boolean;
  login: (request: LoginRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextData | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

const authApi = new AuthApi();

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<AuthSession | null>(null);

  async function login(request: LoginRequest) {
    const result = await authApi.login(request);

    setSession(result);
  }

  function logout() {
    setSession(null);
  }

  const value: AuthContextData = {
    session,
    isAuthenticated: session !== null,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextData {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
