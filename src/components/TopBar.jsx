import React from 'react';
import { motion } from 'framer-motion';
import { useLocation, Link } from 'react-router-dom';
import { Bell, Download, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { format } from 'date-fns';

const pageTitles = {
  '/': { title: 'Home', sub: 'Welcome to WoodCraft Pro' },
  '/dashboard': { title: 'Dashboard', sub: 'Overview of your shop performance' },
  '/inventory': { title: 'Inventory', sub: 'Manage your furniture stock' },
  '/sales': { title: 'Sales', sub: 'Record and track your sales' },
  '/analytics': { title: 'Analytics', sub: 'Deep insights into your business' },
};

export default function TopBar() {
  const location = useLocation();
  const { stats } = useApp();
  const st = stats();
  const info = pageTitles[location.pathname] || pageTitles['/dashboard'];

  return (
    <motion.header
      className="topbar"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="topbar-left">
        <h1>{info.title}</h1>
        <p>{info.sub}</p>
      </div>
      <div className="topbar-right">
        <span className="date-badge">{format(new Date(), 'EEE, MMM d yyyy')}</span>
        {st.lowStock.length > 0 && (
          <div style={{ position: 'relative' }}>
            <button className="topbar-btn" style={{ color: '#dc2626', borderColor: 'rgba(220,38,38,0.2)', background: 'rgba(220,38,38,0.05)' }} title={`${st.lowStock.length} low stock items`}>
              <Bell size={17} />
            </button>
            <span style={{
              position: 'absolute', top: -4, right: -4, background: '#dc2626', color: 'white',
              width: 16, height: 16, borderRadius: '50%', fontSize: '0.6rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700
            }}>{st.lowStock.length}</span>
          </div>
        )}
        <Link to="/inventory">
          <button className="topbar-btn" title="Go to Inventory"><RefreshCw size={17} /></button>
        </Link>
      </div>
    </motion.header>
  );
}
