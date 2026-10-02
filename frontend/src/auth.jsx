import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "./api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    api
      .me()
      .then((data) => {
        if (!cancelled) setUser(data.user);
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      async login(email, password) {
        const data = await api.login({ email, password });
        setUser(data.user);
        return data.user;
      },
      async register(payload) {
        const data = await api.register(payload);
        setUser(data.user);
        return data.user;
      },
      async resetPassword(payload) {
        const data = await api.resetPassword(payload);
        setUser(data.user);
        return data.user;
      },
      async logout() {
        await api.logout();
        setUser(null);
      },
      refresh() {
        return api.me().then((data) => {
          setUser(data.user);
          return data.user;
        });
      },
    }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
