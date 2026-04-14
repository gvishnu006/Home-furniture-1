import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, BarChart2, PieChart, Activity } from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  LineChart, Line, BarChart, Bar, PieChart as RPieChart, Pie, Cell,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';
import { format, parseISO, subDays } from 'date-fns';

/* ─── Custom Tooltip ─────────────────────────────────────────────── */
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#2A1A10', border: '1px solid rgba(244,164,96,0.25)',
      borderRadius: 10, padding: '10px 14px', boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
    }}>
      <p style={{ color: '#F4A460', fontWeight: 700, marginBottom: 4, fontSize: '0.8rem' }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, fontSize: '0.83rem', margin: '2px 0' }}>
          {p.name}: <strong>{typeof p.value === 'number' && p.value > 1000 ? `₹${p.value.toLocaleString()}` : p.value}</strong>
        </p>
      ))}
    </div>
  );
}

/* ─── Section card wrapper ───────────────────────────────────────── */
function ChartCard({ title, icon: Icon, children, delay = 0 }) {
  return (
    <motion.div className="card"
      initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}>
      <div className="card-header">
        <span className="card-title">{title}</span>
        {Icon && <Icon size={18} style={{ color: 'var(--primary-light)' }} />}
      </div>
      <div className="card-body" style={{ paddingTop: 8 }}>{children}</div>
    </motion.div>
  );
}

/* ─── Analytics Page ─────────────────────────────────────────────── */
export default function Analytics() {
  const { state, dailySales, categoryDist, addedVsSold } = useApp();
  const [range, setRange] = useState(14);

  /* ── Data derivations ── */
  const allDaily = dailySales();
  const rangedDaily = allDaily.slice(allDaily.length - range);

  const catDist = categoryDist();

  const avs = addedVsSold();

  /* revenue by category (from sales) */
  const revByCat = (() => {
    const map = {};
    state.sales.forEach(s => { map[s.category] = (map[s.category] || 0) + s.total; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  })();

  /* top sellers */
  const topSellers = (() => {
    const map = {};
    state.sales.forEach(s => { map[s.itemName] = (map[s.itemName] || 0) + s.quantity; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([name, sold]) => ({ name: name.length > 16 ? name.slice(0, 14) + '…' : name, sold }));
  })();

  /* radar data: stock health by category */
  const radarData = catDist.map(c => {
    const catItems = state.inventory.filter(i => i.category === c.name);
    const avgStock = catItems.length ? catItems.reduce((a, i) => a + i.quantity, 0) / catItems.length : 0;
    return { subject: c.name, stock: Math.round(avgStock), fullMark: 20 };
  });

  const PIE_COLORS = ['#8B4513', '#D2691E', '#3B82F6', '#8B5CF6', '#10B981', '#9CA3AF'];

  return (
    <div className="page-wrapper">
      {/* Header */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <h1 className="page-title">Analytics</h1>
        <p className="page-subtitle">Deep-dive charts and performance insights for your shop</p>
      </motion.div>

      {/* Range selector */}
      <motion.div style={{ marginBottom: 24 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
        <div className="tabs">
          {[7, 14, 30].map(r => (
            <button key={r} className={`tab ${range === r ? 'active' : ''}`} onClick={() => setRange(r)}>
              {r === 7 ? 'Last 7 Days' : r === 14 ? 'Last 14 Days' : 'Last 30 Days'}
            </button>
          ))}
        </div>
      </motion.div>

      {/* ── Row 1: Area chart (revenue) + Pie (category) ─── */}
      <div className="charts-grid" style={{ marginBottom: 24 }}>
        <ChartCard title="📈 Revenue Trend" icon={TrendingUp} delay={0.1}>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={rangedDaily} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="lgRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D2691E" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#D2691E" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="lgSold2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C8960C" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#C8960C" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(139,69,19,0.08)" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9E7B6B' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9E7B6B' }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ fontSize: '0.8rem' }} />
              <Area type="monotone" dataKey="revenue" name="Revenue (₹)" stroke="#D2691E" strokeWidth={2.5} fill="url(#lgRevenue)" dot={false} />
              <Area type="monotone" dataKey="sold" name="Units Sold" stroke="#C8960C" strokeWidth={2} fill="url(#lgSold2)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="🥧 Category Distribution" icon={PieChart} delay={0.18}>
          <ResponsiveContainer width="100%" height={200}>
            <RPieChart>
              <Pie data={catDist} cx="50%" cy="50%" outerRadius={80} dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}>
                {catDist.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="none" />)}
              </Pie>
              <Tooltip formatter={(v) => [`${v} units`]} contentStyle={{ background: '#2A1A10', border: '1px solid rgba(244,164,96,0.25)', borderRadius: 8, fontSize: '0.8rem' }} />
            </RPieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 14px', marginTop: 8 }}>
            {catDist.map((c, i) => (
              <span key={c.name} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                <span style={{ width: 9, height: 9, borderRadius: '50%', background: PIE_COLORS[i % PIE_COLORS.length], display: 'inline-block' }} />
                {c.name}: <strong>{c.value}</strong>
              </span>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* ── Row 2: Grouped bar (added vs sold) + Top sellers ─ */}
      <div className="charts-grid" style={{ marginBottom: 24 }}>
        <ChartCard title="📊 Items Added vs Sold (7 Days)" icon={BarChart2} delay={0.22}>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={avs} barGap={4} barSize={20} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(139,69,19,0.08)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#9E7B6B' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#9E7B6B' }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ fontSize: '0.8rem' }} />
              <Bar dataKey="added" name="Added" fill="#8B4513" radius={[6, 6, 0, 0]} />
              <Bar dataKey="sold" name="Sold" fill="#F4A460" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="🏆 Top Selling Items" icon={Activity} delay={0.28}>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={topSellers} layout="vertical" barSize={14} margin={{ top: 0, right: 20, bottom: 0, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(139,69,19,0.08)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#9E7B6B' }} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#6B4C3B' }} axisLine={false} tickLine={false} width={90} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="sold" name="Units Sold" radius={[0, 6, 6, 0]}
                fill="url(#lgHbar)">
                <defs>
                  <linearGradient id="lgHbar" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#8B4513" />
                    <stop offset="100%" stopColor="#F4A460" />
                  </linearGradient>
                </defs>
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* ── Row 3: Revenue by category bar + Radar ────────── */}
      <div className="charts-grid" style={{ marginBottom: 24 }}>
        <ChartCard title="💰 Revenue by Category" delay={0.32}>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={revByCat} barSize={30} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(139,69,19,0.08)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#9E7B6B' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9E7B6B' }} axisLine={false} tickLine={false}
                tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="value" name="Revenue (₹)" radius={[8, 8, 0, 0]}>
                {revByCat.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="🕸️ Stock Health by Category" delay={0.36}>
          {radarData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <RadarChart cx="50%" cy="50%" outerRadius="68%" data={radarData}>
                <PolarGrid stroke="rgba(139,69,19,0.15)" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#9E7B6B' }} />
                <PolarRadiusAxis tick={{ fontSize: 9, fill: '#9E7B6B' }} axisLine={false} />
                <Radar name="Avg Stock" dataKey="stock" stroke="#D2691E" fill="#D2691E" fillOpacity={0.25} />
                <Tooltip contentStyle={{ background: '#2A1A10', border: '1px solid rgba(244,164,96,0.25)', borderRadius: 8, fontSize: '0.8rem' }} />
                <Legend wrapperStyle={{ fontSize: '0.8rem' }} />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state" style={{ padding: '40px 20px' }}>
              <div className="empty-icon">📊</div>
              <p>No inventory data yet</p>
            </div>
          )}
        </ChartCard>
      </div>

      {/* ── Summary Table ──────────────────────────────────── */}
      <ChartCard title="📋 Category Summary" delay={0.4}>
        <div className="table-wrap" style={{ border: 'none' }}>
          <table>
            <thead>
              <tr>
                <th>Category</th><th>Items</th><th>Total Units</th><th>Avg Price</th><th>Revenue</th><th>Share</th>
              </tr>
            </thead>
            <tbody>
              {catDist.map((c, i) => {
                const catItems = state.inventory.filter(inv => inv.category === c.name);
                const avgPrice = catItems.length ? catItems.reduce((a, inv) => a + inv.price, 0) / catItems.length : 0;
                const rev = revByCat.find(r => r.name === c.name)?.value || 0;
                const totalRev = revByCat.reduce((a, r) => a + r.value, 0);
                const share = totalRev ? ((rev / totalRev) * 100).toFixed(1) : 0;
                return (
                  <motion.tr key={c.name} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.42 + i * 0.04 }}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ width: 10, height: 10, borderRadius: '50%', background: PIE_COLORS[i % PIE_COLORS.length], display: 'inline-block' }} />
                        <strong>{c.name}</strong>
                      </div>
                    </td>
                    <td>{catItems.length}</td>
                    <td>{c.value}</td>
                    <td>₹{Math.round(avgPrice).toLocaleString()}</td>
                    <td style={{ fontWeight: 700, color: '#16a34a' }}>₹{rev.toLocaleString()}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="progress-wrap" style={{ flex: 1, marginTop: 0 }}>
                          <div className="progress-bar" style={{ width: `${share}%`, background: PIE_COLORS[i % PIE_COLORS.length] }} />
                        </div>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', minWidth: 30 }}>{share}%</span>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </ChartCard>
    </div>
  );
}
