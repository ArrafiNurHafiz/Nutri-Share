import { StrictMode, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./contexts/AuthContext";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { LoadingSpinner } from "./components/LoadingSpinner";
import { AnimatePresence, motion } from "motion/react";
import InstallPrompt from "./components/InstallPrompt";
import "./index.css";

const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() =>
  import("./pages/Auth").then((m) => ({ default: m.Login })),
);
const RegisterDonor = lazy(() =>
  import("./pages/RegisterDonor").then((m) => ({ default: m.RegisterDonor })),
);
const RegisterRecipient = lazy(() =>
  import("./pages/RegisterRecipient").then((m) => ({
    default: m.RegisterRecipient,
  })),
);
const DonorDashboard = lazy(() =>
  import("./pages/DonorDashboard").then((m) => ({ default: m.DonorDashboard })),
);
const RecipientDashboard = lazy(() =>
  import("./pages/RecipientDashboard").then((m) => ({
    default: m.RecipientDashboard,
  })),
);
const AdminDashboard = lazy(() =>
  import("./pages/AdminDashboard").then((m) => ({ default: m.AdminDashboard })),
);
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const NotFound = lazy(() => import("./pages/NotFound"));

const Loading = () => (
  <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
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
