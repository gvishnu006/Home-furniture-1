import React from 'react';
import { motion } from 'framer-motion';
import { Package, ShoppingCart, PlusCircle, Layers, TrendingUp, AlertTriangle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import CountUp from 'react-countup';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

/* ─── Stat Card ──────────────────────────────────────────────────── */
function StatCard({ icon: Icon, label, value, color, change, prefix = '' }) {
  return (
    <motion.div className={`stat-card ${color}`}
      initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4 }}
    >
      <div className={`stat-icon ${color}`}><Icon size={22} style={{ color: 'white' }} /></div>
      <div className="stat-value">
        {prefix}<CountUp end={Number(value)} duration={2} separator="," />
      </div>
      <div className="stat-label">{label}</div>
      {change !== undefined && (
        <span className={`stat-change ${change >= 0 ? 'up' : 'down'}`}>
          {change >= 0 ? '↑' : '↓'} {Math.abs(change)}%
        </span>
      )}
    </motion.div>
  );
}

/* ─── Custom Tooltip ─────────────────────────────────────────────── */
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#2A1A10', border: '1px solid rgba(244,164,96,0.25)', borderRadius: 10, padding: '10px 14px', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}>
      <p style={{ color: '#F4A460', fontWeight: 700, marginBottom: 4, fontSize: '0.8rem' }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, fontSize: '0.83rem', margin: '2px 0' }}>
          {p.name}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  );
}

/* ─── Dashboard Page ─────────────────────────────────────────────── */
export default function Dashboard() {
  const { stats, dailySales, categoryDist, addedVsSold } = useApp();
  const st = stats();
  const daily = dailySales();
  const catDist = categoryDist();
  const avs = addedVsSold();

  const container = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };

  return (
    <div className="page-wrapper">

      {/* Page Header */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="page-title">Shop Dashboard</h1>
        <p className="page-subtitle">Live overview of your inventory, sales, and performance metrics.</p>
      </motion.div>

      {/* ── Low stock banner ───────────────────────────────── */}
      {st.lowStock.length > 0 && (
        <motion.div className="low-stock-banner" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}>
          <AlertTriangle size={18} style={{ color: '#ef4444', flexShrink: 0 }} />
          <span style={{ color: '#991b1b', fontWeight: 600, fontSize: '0.875rem' }}>
            Low Stock Alert: <strong>{st.lowStock.length} item{st.lowStock.length > 1 ? 's' : ''}</strong> running low —{' '}
            {st.lowStock.map(i => i.name).join(', ')}
          </span>
        </motion.div>
      )}

      {/* ── Stat Cards ─────────────────────────────────────── */}
      <motion.div className="stat-cards-grid" variants={container} initial="hidden" animate="visible">
        <StatCard icon={Layers} label="Total Items in Shop" value={st.totalItems} color="orange" change={5} />
        <StatCard icon={ShoppingCart} label="Items Sold Today" value={st.soldToday} color="green" change={12} />
        <StatCard icon={PlusCircle} label="Added Today" value={st.addedToday} color="blue" />
        <StatCard icon={Package} label="Total Stock (Units)" value={st.totalStock} color="red" change={-3} />
      </motion.div>

      {/* ── Line chart + Pie chart ─────────────────────────── */}
      <div className="charts-grid">
        {/* Line chart: daily sales */}
        <motion.div className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="card-header">
            <span className="card-title">📈 Daily Sales (Last 14 Days)</span>
            <TrendingUp size={18} style={{ color: 'var(--primary-light)' }} />
          </div>
          <div className="card-body" style={{ paddingTop: 8 }}>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={daily} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <defs>
                  <linearGradient id="lgSold" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D2691E" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#D2691E" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(139,69,19,0.08)" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9E7B6B' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9E7B6B' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '0.8rem' }} />
                <Line type="monotone" dataKey="sold" name="Units Sold" stroke="#D2691E" strokeWidth={2.5}
                  dot={{ fill: '#D2691E', strokeWidth: 0, r: 4 }} activeDot={{ r: 6, fill: '#8B4513' }} />
                <Line type="monotone" dataKey="revenue" name="Revenue (₹)" stroke="#C8960C" strokeWidth={2} strokeDasharray="5 3"
                  dot={false} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Pie chart: category distribution */}
        <motion.div className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <div className="card-header">
            <span className="card-title">🪑 Category Split</span>
          </div>
          <div className="card-body" style={{ paddingTop: 4 }}>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={catDist} cx="50%" cy="50%" innerRadius={52} outerRadius={80}
                  paddingAngle={3} dataKey="value">
                  {catDist.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} stroke="none" />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [`${value} units`, name]} contentStyle={{ background: '#2A1A10', border: '1px solid rgba(244,164,96,0.25)', borderRadius: 8, fontSize: '0.8rem' }} />
                <Legend iconType="circle" iconSize={9} wrapperStyle={{ fontSize: '0.78rem' }} />
              </PieChart>
            </ResponsiveContainer>

            {/* Legend under pie */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
              {catDist.map(c => (
                <span key={c.name} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: c.fill, display: 'inline-block' }} />
                  {c.name}: <strong>{c.value}</strong>
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Bar chart: Added vs Sold ────────────────────────── */}
      <motion.div className="card" style={{ marginBottom: 28 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <div className="card-header">
          <span className="card-title">📊 Items Added vs Sold (Last 7 Days)</span>
        </div>
        <div className="card-body">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={avs} barGap={4} barSize={22} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(139,69,19,0.08)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#9E7B6B' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#9E7B6B' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '0.8rem' }} />
              <Bar dataKey="added" name="Items Added" fill="#8B4513" radius={[6, 6, 0, 0]} />
              <Bar dataKey="sold" name="Items Sold" fill="#F4A460" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* ── Low Stock Table ────────────────────────────────── */}
      {st.lowStock.length > 0 && (
        <motion.div className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
          <div className="card-header">
            <span className="card-title">⚠️ Low Stock Items</span>
            <span className="badge badge-danger">{st.lowStock.length} Items</span>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <div className="table-wrap" style={{ border: 'none', borderRadius: 0 }}>
              <table>
                <thead>
                  <tr>
                    <th>Item</th><th>Category</th><th>Stock</th><th>Threshold</th><th>Price</th>
                  </tr>
                </thead>
                <tbody>
                  {st.lowStock.map(item => (
                    <tr key={item.id}>
                      <td style={{ fontWeight: 600 }}>{item.name}</td>
                      <td><span className="badge badge-primary">{item.category}</span></td>
                      <td><span className="badge badge-danger">{item.quantity} left</span></td>
                      <td style={{ color: 'var(--text-muted)' }}>≤ {item.lowStockThreshold}</td>
                      <td style={{ fontWeight: 600 }}>₹{item.price.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
