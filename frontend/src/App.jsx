import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import Footer from "./components/layout/Footer";
import Navbar from "./components/layout/Navbar";
import LoadingScreen from "./components/loading/LoadingScreen";
import { useAuth } from "./context/AuthContext";
import DashboardPage from "./pages/DashboardPage";
import LandingPage from "./pages/LandingPage";
import ProcessingPage from "./pages/ProcessingPage";
import SignUpPage from "./pages/SignUpPage";

function PageTransition({ children }) {
  const location = useLocation();
  return (
    <div key={location.pathname} className="animate-fade-up">
      {children}
    </div>
  );
}

export default function App() {
  // Plays on every page load / reload.
  const [booted, setBooted] = useState(false);
  const { isAuthenticated, ready } = useAuth();

  const handleBootComplete = () => setBooted(true);

  // Boot sequence → sign-up gate → application.
  const showGate = booted && ready && !isAuthenticated;

  return (
    <>
      {!booted && <LoadingScreen onComplete={handleBootComplete} />}

      <AnimatePresence mode="wait">
        {showGate && (
          <motion.div
            key="signup-gate"
            className="fixed inset-0 z-[90] overflow-y-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.03, filter: "blur(10px)" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <SignUpPage />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex min-h-screen flex-col bg-ink-950 text-ink-100">
        <Navbar />
        <main className="flex-1">
          <PageTransition>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/processing" element={<ProcessingPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
            </Routes>
          </PageTransition>
        </main>
        <Footer />
      </div>
    </>
  );
}
