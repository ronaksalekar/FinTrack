import React, { useState } from "react";
import { Mail, Lock, Eye, EyeOff, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import "./LoginPage.css";

export default function LoginPage() {
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setError("");
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setError("");
    setIsLoading(true);

    if (isLogin) {
      // Login Logic
      if (!formData.email || !formData.password) {
        setError("Please fill all the fields!");
        setIsLoading(false);
        return;
      }

      const result = await login(formData.email, formData.password);

      if (result.success) {
        const onboardingComplete = localStorage.getItem('onboardingComplete');
        if (onboardingComplete === 'true') {
          navigate("/dashboard");
        } else {
          navigate("/welcome");
        }
      } else {
        setError(result.message);
      }
    } else {
      // Signup Logic
      if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
        setError("Please fill in all the details!");
        setIsLoading(false);
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match!");
        setIsLoading(false);
        return;
      }

      const result = await signup(formData.name, formData.email, formData.password);

      if (result.success) {
        navigate("/welcome");
      } else {
        setError(result.message);
      }
    }

    setIsLoading(false);
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError("");
    setFormData({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>{isLogin ? "Welcome Back!" : "Create account"}</h1>
            <p>
              {isLogin ? "Login into your account!" : "Sign Up to get started"}
            </p>
          </div>

          {error && (
            <div className="error-box" role="alert">
              <p>{error}</p>
            </div>
          )}

          <div className="auth-form">
            {!isLogin && (
              <div className="auth-form-group">
                <label htmlFor="signup-name">Full Name</label>
                <div className="auth-input-wrapper">
                  <User size={18} aria-hidden="true" />
                  <input
                    id="signup-name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                    autoComplete="name"
                  />
                </div>
              </div>
            )}

            <div className="auth-form-group">
              <label htmlFor="auth-email">Email</label>
              <div className="auth-input-wrapper">
                <Mail size={18} aria-hidden="true" />
                <input
                  id="auth-email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@gmail.com"
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="auth-form-group">
              <label htmlFor="auth-password">Password</label>
              <div className="auth-input-wrapper">
                <Lock size={18} aria-hidden="true" />
                <input
                  id="auth-password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  autoComplete={isLogin ? "current-password" : "new-password"}
                />
                <button
                  type="button"
                  className="auth-eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div className="auth-form-group">
                <label htmlFor="auth-confirm-password">Confirm Password</label>
                <div className="auth-input-wrapper">
                  <Lock size={18} aria-hidden="true" />
                  <input
                    id="auth-confirm-password"
                    type={showPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    autoComplete="new-password"
                  />
                </div>
              </div>
            )}

            {isLogin && (
              <div className="auth-forgot">
                <button type="button">Forgot password?</button>
              </div>
            )}

            <button
              className="auth-submit-btn"
              onClick={handleSubmit}
              disabled={isLoading}
              type="button"
            >
              {isLoading ? "Please wait..." : isLogin ? "Login" : "Sign Up"}
            </button>

            <div className="auth-toggle">
              <span>
                {isLogin ? "Don't have an account? " : "Already have an account? "}
              </span>
              <button type="button" onClick={toggleMode}>
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