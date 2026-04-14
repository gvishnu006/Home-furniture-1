import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, Home, TrendingUp, Bell, Menu, X, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { path: '/', icon: Home, label: 'Home', section: 'main' },
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', section: 'main' },
  { path: '/inventory', icon: Package, label: 'Inventory', section: 'main' },
  { path: '/sales', icon: ShoppingCart, label: 'Sales', section: 'main' },
  { path: '/analytics', icon: TrendingUp, label: 'Analytics', section: 'main' },
];

export default function Navigation() {
  const location = useLocation();
  const { stats } = useApp();
  const [time, setTime] = useState(new Date());
  const [mobileOpen, setMobileOpen] = useState(false);
  const st = stats();

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const timeStr = time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const dateStr = time.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="sidebar-header">
        <div className="logo-wrap">
          <div className="logo-icon">🪵</div>
          <div className="logo-text">
            <h2>WoodCraft</h2>
            <span>Pro Management</span>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        <div className="nav-section-label">Navigation</div>
        {navItems.map(({ path, icon: Icon, label }) => (
          <Link
            key={path}
            to={path}
            className={`nav-item ${location.pathname === path ? 'active' : ''}`}
            onClick={() => setMobileOpen(false)}
          >
            <span className="nav-icon"><Icon size={17} /></span>
            <span>{label}</span>
            {label === 'Inventory' && st.lowStock.length > 0 && (
              <span className="nav-badge">{st.lowStock.length}</span>
            )}
            {location.pathname === path && (
              <ChevronRight size={14} style={{ marginLeft: 'auto', opacity: 0.6 }} />
            )}
          </Link>
        ))}

        <div className="nav-section-label" style={{ marginTop: 16 }}>Quick Stats</div>
        <div style={{ padding: '6px 12px' }}>
          <div style={{ background: 'rgba(244,164,96,0.07)', borderRadius: 10, padding: '12px 14px', border: '1px solid rgba(244,164,96,0.12)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ color: 'rgba(255,248,240,0.5)', fontSize: '0.72rem' }}>Total Items</span>
              <span style={{ color: '#F4A460', fontWeight: 700, fontSize: '0.85rem' }}>{st.totalItems}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ color: 'rgba(255,248,240,0.5)', fontSize: '0.72rem' }}>Sold Today</span>
              <span style={{ color: '#4ade80', fontWeight: 700, fontSize: '0.85rem' }}>{st.soldToday}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'rgba(255,248,240,0.5)', fontSize: '0.72rem' }}>Low Stock</span>
              <span style={{ color: st.lowStock.length ? '#f87171' : '#4ade80', fontWeight: 700, fontSize: '0.85rem' }}>{st.lowStock.length}</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-time">
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#F4A460', fontFamily: 'Playfair Display, serif', letterSpacing: '0.05em' }}>{timeStr}</div>
          <div style={{ fontSize: '0.7rem', marginTop: 2 }}>{dateStr}</div>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="sidebar">
        <SidebarContent />
      </aside>

      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        style={{
          display: 'none',
          position: 'fixed', top: 12, left: 12, zIndex: 150,
          background: 'var(--gradient-wood)', color: 'white',
          border: 'none', borderRadius: 10, width: 40, height: 40,
          alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          boxShadow: 'var(--shadow-md)',
        }}
        className="mobile-menu-btn"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 140, backdropFilter: 'blur(4px)' }}
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            className="sidebar"
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', stiffness: 280, damping: 28 }}
            style={{ zIndex: 145 }}
          >
            <button onClick={() => setMobileOpen(false)} style={{ position: 'absolute', top: 12, right: 12, background: 'transparent', border: 'none', color: '#F4A460', cursor: 'pointer' }}>
              <X size={20} />
            </button>
            <SidebarContent />
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
