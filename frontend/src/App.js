import "./App.css";
import Navbar from "./components/Navbar";
import { Suspense, lazy, useEffect } from "react";

import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import ScrollToTop from "./components/ScrollToTop";
import { AuthProvider, useAuth } from "./components/Auth/AuthContext";
import { EncryptedDataProvider } from "./components/Data/EncryptedDataProvider";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import PageLoader from "./components/common/PageLoader";
import {
  applyTheme,
  getStoredThemePreference,
  persistThemePreference,
  sanitizeTheme,
} from "./utils/theme";
import "./theme.css";

const TransactionForm = lazy(() => import("./components/pages/transactions/TransactionForm"));
const BudgetForm = lazy(() => import("./components/pages/budgets/BudgetForm"));
const LoginPage = lazy(() => import("./components/Auth/LoginPage"));
const Dashboard = lazy(() => import("./components/Dashboard"));
const ReportPage = lazy(() => import("./components/Report/ReportPage"));
const Settings = lazy(() => import("./components/settings/Settings"));
const WelcomePage = lazy(() => import("./components/pages/intro/welcome"));


// =============================
// APP CONTENT (WITH NAVBAR LOGIC)
// =============================
function AppContent() {
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    const themePreference = sanitizeTheme(
      user?.preferences?.theme || getStoredThemePreference()
    );

    persistThemePreference(themePreference);
    return applyTheme(themePreference);
  }, [user?.preferences?.theme]);

  // Hide navbar on auth pages
  const hideNavbarRoutes = ["/login", "/welcome"];
  const showNavbar = !hideNavbarRoutes.includes(location.pathname);

  return (
    <>
      {showNavbar && (
        <div className="fixed top-0 left-0 right-0 z-50">
          <Navbar />
        </div>
      )}

      {/* Toast System (from FIRST app) */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#363636",
            color: "#fff",
          },
          success: {
            iconTheme: {
              primary: "#10b981",
              secondary: "#fff",
            },
          },
          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fff",
            },
          },
        }}
      />

      <div className={showNavbar ? "pt-16" : ""}>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* PUBLIC */}
            <Route path="/login" element={<LoginPage />} />

            {/* ONBOARDING */}
            <Route
              path="/welcome"
              element={
                <ProtectedRoute>
                  <WelcomePage />
                </ProtectedRoute>
              }
            />

            {/* DEFAULT REDIRECT */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* DASHBOARD */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            {/* TRANSACTIONS */}

            <Route
              path="/transactions/add"
              element={
                <ProtectedRoute>
                  <TransactionForm />
                </ProtectedRoute>
              }
            />

            {/* BUDGETS */}
            <Route
              path="/budgets/create"
              element={
                <ProtectedRoute>
                  <BudgetForm />
                </ProtectedRoute>
              }
            />

            {/* REPORT */}
            <Route
              path="/report"
              element={
                <ProtectedRoute>
                  <ReportPage />
                </ProtectedRoute>
              }
            />

            {/* SETTINGS */}
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />

            {/* FALLBACK */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Suspense>
      </div>
    </>
  );
}


// =============================
// MAIN APP WRAPPER
// =============================
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <EncryptedDataProvider>
          <ScrollToTop />
          <AppContent />
        </EncryptedDataProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
