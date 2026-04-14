import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useInView, useAnimation } from 'framer-motion';
import { LayoutDashboard, Package, ShoppingCart, TrendingUp, Award, Zap, Shield } from 'lucide-react';
import CountUp from 'react-countup';

/* ─── Floating particles ─────────────────────────────────────────── */
function Particles() {
  const particles = Array.from({ length: 22 }, (_, i) => ({
    id: i,
    size: Math.random() * 5 + 2,
    left: Math.random() * 100,
    delay: Math.random() * 6,
    duration: Math.random() * 6 + 7,
  }));
  return (
    <div className="hero-particles">
      {particles.map(p => (
        <span key={p.id} className="particle" style={{
          width: p.size, height: p.size,
          left: `${p.left}%`,
          animationDelay: `${p.delay}s`,
          animationDuration: `${p.duration}s`,
        }} />
      ))}
    </div>
  );
}

/* ─── Animated counter ───────────────────────────────────────────── */
function AnimatedCounter({ end, suffix = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <span ref={ref} className="hero-stat-value">
      {inView ? <CountUp end={end} duration={2.5} separator="," suffix={suffix} /> : '0'}
    </span>
  );
}

/* ─── Section reveal ─────────────────────────────────────────────── */
function Reveal({ children, delay = 0, direction = 'up' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const variants = {
    hidden: { opacity: 0, y: direction === 'up' ? 30 : direction === 'down' ? -30 : 0, x: direction === 'left' ? 30 : direction === 'right' ? -30 : 0 },
    visible: { opacity: 1, y: 0, x: 0 },
  };
  return (
    <motion.div ref={ref} variants={variants} initial="hidden" animate={inView ? 'visible' : 'hidden'}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  );
}

/* ─── Wood grain animated lines ──────────────────────────────────── */
function WoodGrain() {
  return (
    <div className="wood-lines">
      {Array.from({ length: 12 }, (_, i) => (
        <motion.div key={i} className="wood-line"
          style={{ top: `${(i + 1) * 8}%` }}
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 2, delay: i * 0.1, ease: 'easeOut' }}
        />
      ))}
    </div>
  );
}

/* ─── Category cards data ────────────────────────────────────────── */
const categories = [
  { emoji: '🪑', name: 'Chairs', count: '48 items', desc: 'Dining, office & lounge chairs' },
  { emoji: '🛏️', name: 'Beds', count: '22 items', desc: 'Single, double & king beds' },
  { emoji: '🪵', name: 'Tables', count: '35 items', desc: 'Dining, coffee & study desks' },
  { emoji: '🛋️', name: 'Sofas', count: '18 items', desc: 'L-shape, sectional & love seats' },
  { emoji: '🗄️', name: 'Wardrobes', count: '14 items', desc: 'Sliding, hinged & walk-in' },
  { emoji: '📦', name: 'Other', count: '29 items', desc: 'Shelves, cabinets & more' },
];

const features = [
  { icon: LayoutDashboard, title: 'Live Dashboard', desc: 'Real-time metrics, sales charts, and inventory overview updated instantly as you work.' },
  { icon: Package, title: 'Smart Inventory', desc: 'Auto low-stock alerts, category filters, search, and bulk management tools.' },
  { icon: ShoppingCart, title: 'Point of Sale', desc: 'Record sales in seconds, auto-deduct stock, and generate PDF reports on-demand.' },
  { icon: TrendingUp, title: 'Analytics', desc: 'Daily, weekly, and monthly sales insights with interactive Recharts visualizations.' },
  { icon: Award, title: 'Premium Design', desc: 'Crafted with a rich wood-brown aesthetic, smooth Framer Motion animations throughout.' },
  { icon: Shield, title: 'Local Persistence', desc: 'All data saved locally via localStorage — no backend required, zero latency.' },
];

/* ─── Main Home Component ────────────────────────────────────────── */
export default function Home() {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="home-page">

      {/* ── HERO ────────────────────────────────────────── */}
      <section className="hero">
        <div className="hero-bg" style={{ transform: `translateY(${scrollY * 0.3}px)` }} />
        <WoodGrain />
        <Particles />

        {/* Badge */}
        <motion.div className="hero-badge"
          initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <Zap size={13} /> Premium Carpenter Management System
        </motion.div>

        {/* Title */}
        <motion.h1 className="hero-title"
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.15 }}>
          Craft Your <span className="highlight">Business</span><br />With Precision
        </motion.h1>

        {/* Subtitle */}
        <motion.p className="hero-desc"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }}>
          The all-in-one inventory and sales platform built for carpenters and furniture shops.
          Track stock, record sales, and grow your craft business — beautifully.
        </motion.p>

        {/* CTA */}
        <motion.div className="hero-cta-group"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.45 }}>
          <button className="hero-cta-primary" onClick={() => navigate('/dashboard')}>
            Open Dashboard →
          </button>
          <button className="hero-cta-secondary" onClick={() => navigate('/inventory')}>
            View Inventory
          </button>
        </motion.div>

        {/* Hero Stats */}
        <motion.div className="hero-stats"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.65 }}>
          {[
            { value: 500, suffix: '+', label: 'Items Managed' },
            { value: 280, suffix: '+', label: 'Sales Recorded' },
            { value: 99, suffix: '%', label: 'Uptime' },
          ].map((s, i) => (
            <div key={i} className="hero-stat">
              <AnimatedCounter end={s.value} suffix={s.suffix} />
              <div className="hero-stat-label">{s.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Scroll hint */}
        <div className="scroll-indicator">
          <span>Scroll</span>
          <div className="scroll-line" />
        </div>
      </section>

      {/* ── CATEGORIES ───────────────────────────────────── */}
      <section className="home-section">
        <Reveal>
          <span className="section-tag">Furniture Categories</span>
          <h2 className="section-title">Everything In One Place</h2>
          <p className="section-subtitle">Manage every type of furniture with dedicated category tracking, smart filters, and instant stock status.</p>
        </Reveal>

        <div className="categories-grid">
          {categories.map((cat, i) => (
            <Reveal key={cat.name} delay={i * 0.08}>
              <motion.div
                className="category-card"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/inventory')}
              >
                <span className="category-emoji">{cat.emoji}</span>
                <div className="category-name">{cat.name}</div>
                <div className="category-count">{cat.count} · {cat.desc}</div>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────── */}
      <section className="home-section home-section-alt">
        <Reveal>
          <span className="section-tag">Features</span>
          <h2 className="section-title">Built For Craftsmen</h2>
          <p className="section-subtitle">Every feature designed to make your carpenter shop run smoother, faster, and smarter.</p>
        </Reveal>

        <div className="features-grid">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.07} direction="up">
              <motion.div className="feature-card" whileHover={{ scale: 1.02 }}>
                <div className="feature-icon-wrap">
                  <f.icon size={22} />
                </div>
                <div className="feature-title">{f.title}</div>
                <div className="feature-desc">{f.desc}</div>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── CTA BANNER ───────────────────────────────────── */}
      <section className="home-section" style={{ textAlign: 'center', padding: '80px 40px' }}>
        <Reveal>
          <motion.div style={{
            background: 'linear-gradient(135deg, rgba(139,69,19,0.25) 0%, rgba(200,150,12,0.15) 100%)',
            border: '1px solid rgba(244,164,96,0.25)',
            borderRadius: 32, padding: '60px 40px',
            backdropFilter: 'blur(10px)',
          }}
            whileHover={{ boxShadow: '0 0 60px rgba(200,150,12,0.2)' }}
          >
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>🪵</div>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2.5rem', color: '#FFDAB9', marginBottom: 16 }}>
              Ready to Grow Your Shop?
            </h2>
            <p style={{ color: 'rgba(255,248,240,0.6)', fontSize: '1rem', marginBottom: 36, maxWidth: 480, margin: '0 auto 36px' }}>
              Jump into your dashboard, add your inventory, and start recording sales today.
            </p>
            <div style={{ display: 'flex', gap: 14, justifyContent: 'center' }}>
              <motion.button className="hero-cta-primary" whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} onClick={() => navigate('/dashboard')}>
                Go to Dashboard
              </motion.button>
              <motion.button className="hero-cta-secondary" whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} onClick={() => navigate('/sales')}>
                Record a Sale
              </motion.button>
            </div>
          </motion.div>
        </Reveal>
      </section>

      {/* Footer */}
      <footer style={{ background: '#110905', padding: '28px 40px', textAlign: 'center', borderTop: '1px solid rgba(244,164,96,0.1)' }}>
        <p style={{ color: 'rgba(255,248,240,0.3)', fontSize: '0.8rem' }}>
          © 2026 WoodCraft Pro · Built with ❤️ for Carpenters
        </p>
      </footer>
    </div>
  );
}
