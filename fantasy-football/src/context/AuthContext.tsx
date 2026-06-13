import { createContext, useContext, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { authApi, type AuthUser } from "@/api/auth";

interface AuthContextValue {
  token: string;
  user: AuthUser | null;
  pendingPhone: string;
  isLoggedIn: boolean;
  saveAuth: (token: string, user: AuthUser) => void;
  setPendingPhone: (phone: string) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function loadUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem("fantasy_user");
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [token, setToken] = useState(() => localStorage.getItem("fantasy_token") ?? "");
  const [user, setUser] = useState<AuthUser | null>(loadUser);
  const [pendingPhone, setPendingPhone] = useState("");

  const saveAuth = (newToken: string, newUser: AuthUser) => {
    localStorage.setItem("fantasy_token", newToken);
    localStorage.setItem("fantasy_user", JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    queryClient.invalidateQueries();
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore — clear locally regardless
    }
    localStorage.removeItem("fantasy_token");
    localStorage.removeItem("fantasy_user");
    setToken("");
    setUser(null);
    queryClient.clear();
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        pendingPhone,
        isLoggedIn: !!token,
        saveAuth,
        setPendingPhone,
        logout,
      }}
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
