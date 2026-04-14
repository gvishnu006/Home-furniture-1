import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { AppProvider } from './context/AppContext';
import Navigation from './components/Navigation';
import TopBar from './components/TopBar';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Sales from './pages/Sales';
import Analytics from './pages/Analytics';

/* ─── Page transition wrapper ────────────────────────────────────── */
const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.25 } },
};

function AnimatedRoutes() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div className="app-layout">
      {/* Sidebar always visible */}
      <Navigation />

      {/* Main content area */}
      <main className="main-content">
        {/* Top bar — hidden on home page (it has its own full-page design) */}
        {!isHome && <TopBar />}

        <AnimatePresence mode="wait">
          <motion.div key={location.pathname} variants={pageVariants} initial="initial" animate="animate" exit="exit">
            <Routes location={location}>
              <Route path="/"          element={<Home />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/sales"     element={<Sales />} />
              <Route path="/analytics" element={<Analytics />} />
              {/* Catch-all → dashboard */}
              <Route path="*"          element={<Dashboard />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

/* ─── Root App ───────────────────────────────────────────────────── */
export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AnimatedRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: '#2A1A10',
              color: '#FFDAB9',
              border: '1px solid rgba(244,164,96,0.3)',
              borderRadius: 10,
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.875rem',
            },
          }}
        />
      </BrowserRouter>
    </AppProvider>
  );
}
