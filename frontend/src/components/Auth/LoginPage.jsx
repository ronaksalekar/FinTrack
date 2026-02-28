import React, { useState, useEffect } from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";
import "./LoginPage.css";

export default function LoginPage() {
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showRecoveryKey, setShowRecoveryKey] = useState(false);
  const [recoveryKey] = useState("");

  /* ================= Prevent Refresh During Recovery Key ================= */
  useEffect(() => {
    if (showRecoveryKey) {
      window.onbeforeunload = () => true;
    }
    return () => (window.onbeforeunload = null);
  }, [showRecoveryKey]);

  /* ================= SUBMIT ================= */
  const handleSubmit = async () => {
    setIsLoading(true);

    if (!email || !email.includes("@")) {
      toast.error("Enter a valid email");
      setIsLoading(false);
      return;
    }

    if (!isLogin && !name) {
      toast.error("Enter your name");
      setIsLoading(false);
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      toast.error("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      setIsLoading(false);
      return;
    }

    try {
      if (isLogin) {
        const result = await login(email, password);

        if (result.success) {
          if (!result.user.onboardingComplete) {
            navigate("/welcome");
          } else {
            navigate("/dashboard");
          }
        } else {
          toast.error(result.message || "Login failed");
        }
      } else {
        const result = await signup(name, email, password);

        if (result.success) {
          if (!result.user.onboardingComplete) {
            navigate("/welcome");
          } else {
            navigate("/dashboard");
          }
        } else {
          toast.error(result.message || "Signup failed");
        }
      }
    } catch {
      toast.error("Something went wrong");
    }

    setIsLoading(false);
  };

  /* ================= RECOVERY KEY SCREEN ================= */
  if (showRecoveryKey) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-card">
            <div className="auth-header">
              <h1>⚠️ Save Your Recovery Key</h1>
              <p>This is the ONLY way to recover your encrypted data.</p>
            </div>

            <div className="error-box">
              <strong>Important:</strong> Store this key securely.
            </div>

            <div className="auth-form-group">
              <div className="recovery-key-display">
                <code>{recoveryKey}</code>
              </div>
            </div>

            <button
              className="auth-submit-btn"
              onClick={() => {
                navigator.clipboard.writeText(recoveryKey);
                toast.success("Recovery key copied!");
              }}
            >
              Copy to Clipboard
            </button>

            <button
              className="auth-submit-btn"
              onClick={() => {
                setShowRecoveryKey(false);
                navigate("/dashboard");
              }}
            >
              I've Saved My Recovery Key
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ================= MAIN LOGIN FORM ================= */
  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>{isLogin ? "Welcome Back!" : "Create Account"}</h1>
            <p>
              {isLogin
                ? "Login to access your encrypted finance data"
                : "Your data is end-to-end encrypted. We cannot access it."}
            </p>
          </div>

          <div className="auth-form">
            {!isLogin && (
              <div className="auth-form-group">
                <label>Full Name</label>
                <div className="auth-input-wrapper">
                  <Mail size={18} />
                  <input
                    type="text"
                    value={name}
                    placeholder="Your full name"
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* EMAIL */}
            <div className="auth-form-group">
              <label>Email</label>
              <div className="auth-input-wrapper">
                <Mail size={18} />
                <input
                  type="email"
                  value={email}
                  placeholder="you@gmail.com"
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div className="auth-form-group">
              <label>Password</label>
              <div className="auth-input-wrapper">
                <Lock size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  placeholder="At least 12 characters"
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="auth-eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* CONFIRM PASSWORD */}
            {!isLogin && (
              <div className="auth-form-group">
                <label>Confirm Password</label>
                <div className="auth-input-wrapper">
                  <Lock size={18} />
                  <input
                    type="password"
                    value={confirmPassword}
                    placeholder="Re-enter password"
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>
            )}

            {!isLogin && (
              <div className="error-box">
                🔒 Your data is encrypted locally. If you forget your password,
                you will need your recovery key.
              </div>
            )}

            <button
              className="auth-submit-btn"
              onClick={handleSubmit}
              disabled={isLoading}
              type="button"
            >
              {isLoading ? "Processing..." : isLogin ? "Login" : "Sign Up"}
            </button>

            <div className="auth-toggle">
              <span>
                {isLogin
                  ? "Don't have an account? "
                  : "Already have an account? "}
              </span>
              <button type="button" onClick={() => setIsLogin(!isLogin)}>
                {isLogin ? "Sign Up" : "Login"}
              </button>
            </div>
          </div>
        </div>
        <p className="auth-footer">@FinTrack Expense Tracker App</p>
      </div>
    </div>
  );
}
