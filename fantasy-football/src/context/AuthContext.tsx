import { createContext, useContext, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

interface AuthContextValue {
  token: string;
  setToken: (token: string) => void;
  clearToken: () => void;
  isLoggedIn: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [token, setTokenState] = useState(
    () => localStorage.getItem("fantasy_token") ?? ""
  );

  const setToken = (t: string) => {
    localStorage.setItem("fantasy_token", t);
    setTokenState(t);
    queryClient.invalidateQueries();
  };

  const clearToken = () => {
    localStorage.removeItem("fantasy_token");
    setTokenState("");
    queryClient.invalidateQueries();
  };

  return (
    <AuthContext.Provider
      value={{ token, setToken, clearToken, isLoggedIn: !!token }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
