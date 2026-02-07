import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import "./AuthContext.css";

const AuthContext = createContext(null);
const API_URL = "http://localhost:5000/api/auth";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      axios
        .get(`${API_URL}/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          setUser(res.data.user);
        })
        .catch(() => {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

 const login = async (email, password) => {
  try {
    const res = await axios.post(`${API_URL}/login`, { email, password });
    localStorage.setItem("token", res.data.token);
    setUser(res.data.user);
    
    // Save onboarding status
    if (res.data.user.onboardingComplete) {
      localStorage.setItem('onboardingComplete', 'true');
    }
    
    return { success: true };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Login failed",
    };
  }
};

const signup = async (name, email, password) => {
  try {
    const res = await axios.post(`${API_URL}/signup`, {
      name,
      email,
      password,
    });
    localStorage.setItem("token", res.data.token);
    setUser(res.data.user);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Signup failed",
    };
  }
};
  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
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
        isAuthenticated: Boolean(user),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
