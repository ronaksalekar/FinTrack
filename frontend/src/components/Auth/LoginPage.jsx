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

  const handlechange = (e) => {
    setError("");
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setError("");
    setIsLoading(true);

    if (isLogin) {
      if (!formData.email || !formData.password) {
        setError("Please fill all the fields!");
        setIsLoading(false);
        return;
      }

      const result = await login(formData.email, formData.password);

      if (result.success) {
        navigate("/dashboard");
      } else {
        setError(result.message);
      }
    } else {
      if (
        !formData.name ||
        !formData.email ||
        !formData.password ||
        !formData.confirmPassword
      ) {
        setError("Please fill in all the details!");
        setIsLoading(false);
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match!");
        setIsLoading(false);
        return;
      }

      const result = await signup(
        formData.name,
        formData.email,
        formData.password
      );

      if (result.success) {
        navigate("/dashboard");
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
    <>
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-card">
            <div className="auth-header">
              <h1>{isLogin ? "Welcome Back!" : "Create account"}</h1>
              <p>
                {isLogin
                  ? "Login into your account!"
                  : "Sign Up to get started"}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="error-box">
                <p>{error}</p>
              </div>
            )}

            <div className="form">
              {!isLogin && (
                <div className="form-group">
                  <label>Full Name</label>
                  <div className="input-icon">
                    <User size={18} />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handlechange}
                      placeholder="Enter your name"
                    />
                  </div>
                </div>
              )}

              <div className="form-group">
                <label>Email</label>
                <div className="input-icon">
                  <Mail size={18} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handlechange}
                    placeholder="you@gmail.com"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Password</label>
                <div className="input-icon">
                  <Lock size={18} />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handlechange}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="eye-btn"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {!isLogin && (
                <div className="form-group">
                  <label>Confirm Password</label>
                  <div className="input-icon">
                    <Lock size={18} />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handlechange}
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              )}

              {isLogin && (
                <div className="forgot">
                  <button>Forgot password?</button>
                </div>
              )}

              <button
                className="submit-btn"
                onClick={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? "Please wait..." : isLogin ? "Login" : "Sign Up"}
              </button>

              <div className="toggle">
                <span>
                  {isLogin
                    ? "Don't have an account? "
                    : "Already have an account? "}
                </span>
                <button onClick={toggleMode}>
                  {isLogin ? "Sign Up" : "Login"}
                </button>
              </div>
            </div>
          </div>
          <p className="footer">@FinTrack Expense Tracker App</p>
        </div>
      </div>
    </>
  );
}
