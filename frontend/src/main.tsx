import { StrictMode, lazy, Suspense, type ComponentType } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./contexts/AuthContext";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { LoadingSpinner } from "./components/LoadingSpinner";
import { AnimatePresence, motion } from "motion/react";
import InstallPrompt from "./components/InstallPrompt";
import "./index.css";

// Handle Vite dynamic import chunk loading errors (e.g. after a new deployment)
window.addEventListener("vite:preloadError", (event) => {
  event.preventDefault();
  const refreshedKey = "vite_preload_error_reload";
  const attempts = Number(sessionStorage.getItem(refreshedKey) || 0);
  if (attempts < 2) {
    sessionStorage.setItem(refreshedKey, String(attempts + 1));
    window.location.reload();
  }
});

function safeLazy<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T } | T>,
) {
  return lazy(async () => {
    try {
      const res = await factory();
      sessionStorage.removeItem("vite_preload_error_reload");
      return "default" in res ? res : { default: res as T };
    } catch (error: any) {
      const refreshedKey = "vite_preload_error_reload";
      const attempts = Number(sessionStorage.getItem(refreshedKey) || 0);
      if (attempts < 2) {
        sessionStorage.setItem(refreshedKey, String(attempts + 1));
        window.location.reload();
        return new Promise(() => {}) as any;
      }
      throw error;
    }
  });
}

const Home = safeLazy(() => import("./pages/Home"));
const Login = safeLazy(() => import("./pages/Auth").then((m) => m.Login));
const RegisterDonor = safeLazy(() =>
  import("./pages/RegisterDonor").then((m) => m.RegisterDonor),
);
const RegisterRecipient = safeLazy(() =>
  import("./pages/RegisterRecipient").then((m) => m.RegisterRecipient),
);
const DonorDashboard = safeLazy(() =>
  import("./pages/DonorDashboard").then((m) => m.DonorDashboard),
);
const RecipientDashboard = safeLazy(() =>
  import("./pages/RecipientDashboard").then((m) => m.RecipientDashboard),
);
const AdminDashboard = safeLazy(() =>
  import("./pages/AdminDashboard").then((m) => m.AdminDashboard),
);
const ForgotPassword = safeLazy(() => import("./pages/ForgotPassword"));
const ResetPassword = safeLazy(() => import("./pages/ResetPassword"));
const NotFound = safeLazy(() => import("./pages/NotFound"));

const Loading = () => (
  <div className="min-h-[100dvh] bg-[var(--bg-primary)] flex items-center justify-center">
    <LoadingSpinner size={32} label="Memuat halaman..." />
  </div>
);

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2 }}
      >
        <Suspense fallback={<Loading />}>
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register/donor" element={<RegisterDonor />} />
            <Route path="/register/recipient" element={<RegisterRecipient />} />
            <Route path="/donor" element={<DonorDashboard />} />
            <Route path="/recipient" element={<RecipientDashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </motion.div>
    </AnimatePresence>
  );
}

function AppRouter() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              borderRadius: "12px",
              background: "#333",
              color: "#fff",
              padding: "12px 16px",
              fontSize: "14px",
            },
            success: {
              iconTheme: { primary: "#52C77F", secondary: "#fff" },
              style: { background: "#2D7A4F", color: "#fff" },
            },
            error: {
              iconTheme: { primary: "#E53935", secondary: "#fff" },
              style: { background: "#C62828", color: "#fff" },
            },
          }}
        />
        <ErrorBoundary>
          <AnimatedRoutes />
          <InstallPrompt />
        </ErrorBoundary>
      </AuthProvider>
    </BrowserRouter>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppRouter />
  </StrictMode>,
);
