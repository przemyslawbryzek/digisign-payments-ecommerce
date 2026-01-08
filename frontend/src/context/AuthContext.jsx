import { createContext, useState, useEffect } from "react";
import { api } from "../api/api";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isLogged, setIsLogged] = useState(false);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const loadProfile = async () => {
    try {
      const res = await api.get("/profile");
      setUser(res.data);
      setIsAdmin(res.data.is_admin);
    } catch {}
  };

  useEffect(() => {
    const hasToken = !!localStorage.getItem("token");
    setIsLogged(hasToken);
    if (hasToken) loadProfile();
  }, []);

  const login = async (token) => {
    localStorage.setItem("token", token);
    setIsLogged(true);
    await loadProfile();
  };

  const logout = () => {
    localStorage.removeItem("token");
    setIsLogged(false);
    setUser(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ isLogged, login, logout, user, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}