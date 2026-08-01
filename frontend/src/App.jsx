import { Route, Routes, useLocation } from "react-router-dom";
import Footer from "./components/layout/Footer";
import Navbar from "./components/layout/Navbar";
import DashboardPage from "./pages/DashboardPage";
import LandingPage from "./pages/LandingPage";
import ProcessingPage from "./pages/ProcessingPage";

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
  );
}
