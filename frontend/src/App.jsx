import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import LandingPage from "./pages/LandingPage";
import ProcessingPage from "./pages/ProcessingPage";
import DashboardPage from "./pages/DashboardPage";

function PageTransition({ children }) {
  const location = useLocation();
  return (
    <div key={location.pathname} className="animate-fade-up">
      {children}
    </div>
  );
}

export default function App() {
  return (
    <div className="flex min-h-screen flex-col bg-ink-50 dark:bg-ink-950">
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
  );
}
