import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import axios from "axios";
import { deriveKey } from "../../utils/encryption";
import { API_BASE_URL } from "../../config/api";

const AuthContext = createContext(null);
const API_URL = `${API_BASE_URL}/api/auth`;
const TOKEN_KEY = "token";
const ENC_KEY = "encKey";
const ENC_ALT_KEY = "encKeyAlt";

const getAuthErrorMessage = (err, fallbackMessage) => {
  const responseData = err.response?.data;

  if (typeof responseData === "string" && responseData.trim()) {
    return responseData;
  }

  if (typeof responseData?.message === "string" && responseData.message.trim()) {
    return responseData.message;
  }

  if (err.response?.status === 429) {
    const retryAfter = responseData?.retryAfterSeconds || err.response?.headers?.["retry-after"];
    if (retryAfter) {
      return `Too many attempts. Try again in ${retryAfter}s.`;
    }
    return "Too many attempts. Please wait and try again.";
  }

  return fallbackMessage;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [encryptionKey, setEncryptionKeyState] = useState(
    localStorage.getItem(ENC_KEY) || null
  );

  const setEncryptionKey = useCallback((key) => {
    setEncryptionKeyState(key);

    if (key) {
      localStorage.setItem(ENC_KEY, key);
    } else {
      localStorage.removeItem(ENC_KEY);
    }
  }, []);

  const getAuthHeader = useCallback(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const persistLogin = useCallback(
    (resData, password) => {
      setUser(resData.user);
      localStorage.setItem(TOKEN_KEY, resData.token);

      const derivedKey = deriveKey(
        password,
        resData.user.email.toLowerCase()
      ).toString();

      setEncryptionKey(password);
      localStorage.setItem(ENC_ALT_KEY, derivedKey);
    },
    [setEncryptionKey]
  );

  useEffect(() => {
    let isMounted = true;

    const bootstrapUser = async () => {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) {
        if (isMounted) setAuthLoading(false);
        return;
      }

      try {
        const res = await axios.get(`${API_URL}/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (isMounted) {
          setUser(res.data.user);
        }
      } catch {
        localStorage.removeItem(TOKEN_KEY);
      } finally {
        if (isMounted) setAuthLoading(false);
      }
    };

    bootstrapUser();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (email, password) => {
    try {
      const res = await axios.post(`${API_URL}/login`, {
        email,
        password,
      });

      persistLogin(res.data, password);

      return {
        success: true,
        user: res.data.user,
      };
    } catch (err) {
      return {
        success: false,
        message: getAuthErrorMessage(err, "Login failed"),
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

      persistLogin(res.data, password);

      return {
        success: true,
        user: res.data.user,
      };
    } catch (err) {
      return {
        success: false,
        message: getAuthErrorMessage(err, "Signup failed"),
      };
    }
  };

  const logout = () => {
    setUser(null);
    setEncryptionKey(null);
    localStorage.removeItem(ENC_ALT_KEY);
    localStorage.removeItem(TOKEN_KEY);
  };

  const value = {
    user,
    setUser,
    login,
    signup,
    logout,
    encryptionKey,
    setEncryptionKey,
    getAuthHeader,
    authLoading,
    isAuthenticated: Boolean(user),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
