import { createContext, useContext, useState, useEffect } from "react";
import "./AuthContext.css";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (email, password) => {
    if (!email || !password) return false;

    const userData = {
      id: Date.now(),
      email,
      name: email.split("@")[0]
    };

    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    return true;
  };

  const signup = (name, email, password) => {
    if (!name || !email || !password) return false;

    const userData = {
      id: Date.now(),
      name,
      email
    };

    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  if (loading) {
    return <div className="auth-loading">Loading...</div>;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        isAuthenticated: Boolean(user)
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
