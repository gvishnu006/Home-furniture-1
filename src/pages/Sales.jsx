import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Plus, X, Download, Search } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { format, parseISO } from 'date-fns';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/* ─── Record Sale Modal ──────────────────────────────────────────── */
function SaleModal({ onClose }) {
  const { state, dispatch } = useApp();
  const [itemId, setItemId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  const inStock = state.inventory.filter(i => i.quantity > 0);
  const selected = state.inventory.find(i => i.id === itemId);

  const submit = () => {
    if (!itemId) { setError('Please select an item'); return; }
    if (quantity < 1) { setError('Quantity must be at least 1'); return; }
    if (selected && quantity > selected.quantity) { setError(`Only ${selected.quantity} units in stock`); return; }
    dispatch({ type: 'RECORD_SALE', payload: { itemId, quantity, note } });
    toast.success(`Sale recorded — ${quantity}× ${selected?.name}!`, {
      style: { background: '#2A1A10', color: '#FFDAB9', border: '1px solid rgba(244,164,96,0.3)', borderRadius: 10 },
    });
    onClose();
  };

  return (
    <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div className="modal" style={{ maxWidth: 460 }}
        initial={{ scale: 0.92, y: 24 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92 }}
        transition={{ type: 'spring', stiffness: 320, damping: 26 }}>
        <div className="modal-header">
          <h2 className="modal-title">🛒 Record Sale</h2>
          <button className="modal-close" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="modal-body">
          {error && <div className="alert alert-danger" style={{ marginBottom: 16 }}>{error}</div>}

          <div className="form-group">
            <label className="form-label">Select Item *</label>
            <select className="form-control" value={itemId} onChange={e => { setItemId(e.target.value); setError(''); }}>
              <option value="">— Choose an item —</option>
              {inStock.map(i => (
                <option key={i.id} value={i.id}>{i.name} ({i.quantity} in stock · ₹{i.price.toLocaleString()})</option>
              ))}
            </select>
          </div>

          {selected && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              style={{ background: 'var(--cream-dark)', borderRadius: 10, padding: '14px 16px', marginBottom: 16, border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Unit Price</span>
                <span style={{ fontWeight: 700, color: 'var(--primary)' }}>₹{selected.price.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Total</span>
                <span style={{ fontWeight: 700, color: '#16a34a', fontSize: '1.1rem' }}>₹{(selected.price * quantity).toLocaleString()}</span>
              </div>
            </motion.div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Quantity *</label>
              <input className="form-control" type="number" min="1" max={selected?.quantity || 9999} value={quantity}
                onChange={e => { setQuantity(Number(e.target.value)); setError(''); }} />
            </div>
            <div className="form-group">
              <label className="form-label">Note (optional)</label>
              <input className="form-control" placeholder="e.g. Bulk order" value={note} onChange={e => setNote(e.target.value)} />
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-success" onClick={submit}><ShoppingCart size={15} /> Confirm Sale</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── PDF Download ───────────────────────────────────────────────── */
function downloadPDF(sales, period) {
  const doc = new jsPDF();
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('WoodCraft Pro — Sales Report', 14, 20);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100);
  doc.text(`Period: ${period} · Generated: ${format(new Date(), 'PPpp')}`, 14, 30);

  const total = sales.reduce((a, s) => a + s.total, 0);
  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.text(`Total Revenue: Rs.${total.toLocaleString()}  |  Total Sales: ${sales.length}`, 14, 42);

  autoTable(doc, {
    startY: 50,
    head: [['#', 'Item', 'Category', 'Qty', 'Unit Price', 'Total', 'Date', 'Note']],
    body: sales.map((s, i) => [
      i + 1, s.itemName, s.category, s.quantity,
      `Rs.${s.price.toLocaleString()}`,
      `Rs.${s.total.toLocaleString()}`,
      format(parseISO(s.soldAt), 'dd MMM yyyy, hh:mm a'),
      s.note || '—',
    ]),
    headStyles: { fillColor: [139, 69, 19], textColor: 255, fontStyle: 'bold', fontSize: 9 },
    alternateRowStyles: { fillColor: [255, 248, 240] },
    styles: { fontSize: 8.5 },
  });

  doc.save(`WoodCraft_Sales_${period}_${format(new Date(), 'yyyyMMdd')}.pdf`);
  toast.success('PDF report downloaded!', { style: { background: '#2A1A10', color: '#FFDAB9', border: '1px solid rgba(244,164,96,0.3)', borderRadius: 10 } });
}

/* ─── Sales Page ─────────────────────────────────────────────────── */
export default function Sales() {
  const { salesByPeriod } = useApp();
  const [period, setPeriod] = useState('daily');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);

  const periodSales = salesByPeriod(period);
  const filtered = useMemo(() => {
    return periodSales.filter(s =>
      s.itemName.toLowerCase().includes(search.toLowerCase()) ||
      s.category.toLowerCase().includes(search.toLowerCase())
    );
  }, [periodSales, search]);

  const revenue = filtered.reduce((a, s) => a + s.total, 0);
  const units = filtered.reduce((a, s) => a + s.quantity, 0);

  return (
    <div className="page-wrapper">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="page-title">Sales</h1>
        <p className="page-subtitle">Record transactions and download reports</p>
      </motion.div>

      {/* Summary mini-cards */}
      <motion.div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
        {[
          { label: 'Total Sales', value: filtered.length, color: '#8B4513' },
          { label: 'Units Sold', value: units, color: '#16a34a' },
          { label: 'Revenue', value: `₹${revenue.toLocaleString()}`, color: '#1d4ed8', isText: true },
        ].map((m, i) => (
          <div key={i} style={{
            background: 'white', borderRadius: 12, padding: '16px 24px',
            border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)',
            flex: '1 1 150px', minWidth: 140,
          }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 4 }}>{m.label}</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: m.color, fontFamily: 'Playfair Display, serif' }}>{m.value}</div>
          </div>
        ))}
      </motion.div>

      {/* Toolbar */}
      <motion.div className="toolbar" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
        <div className="tabs">
          {['daily', 'weekly', 'monthly'].map(p => (
            <button key={p} className={`tab ${period === p ? 'active' : ''}`} onClick={() => setPeriod(p)}>
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>

        <div className="search-wrap">
          <Search size={15} className="search-icon" />
          <input className="search-input" placeholder="Search sales…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <button className="btn btn-secondary" onClick={() => downloadPDF(filtered, period)} style={{ marginLeft: 'auto' }}>
          <Download size={15} /> Download PDF
        </button>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={15} /> Record Sale
        </button>
      </motion.div>

      {/* Sales table */}
      <motion.div className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div className="table-wrap" style={{ border: 'none' }}>
          {filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🛒</div>
              <h3>No sales found</h3>
              <p>Record your first sale using the button above.</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>#</th><th>Item</th><th>Category</th><th>Qty</th>
                  <th>Unit Price</th><th>Total</th><th>Date & Time</th><th>Note</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filtered.map((sale, idx) => (
                    <motion.tr key={sale.id}
                      initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 8 }} transition={{ delay: idx * 0.025 }}>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{idx + 1}</td>
                      <td style={{ fontWeight: 600 }}>{sale.itemName}</td>
                      <td><span className="badge badge-primary">{sale.category}</span></td>
                      <td style={{ fontWeight: 700 }}>{sale.quantity}</td>
                      <td>₹{sale.price.toLocaleString()}</td>
                      <td style={{ fontWeight: 700, color: '#16a34a' }}>₹{sale.total.toLocaleString()}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        {format(parseISO(sale.soldAt), 'dd MMM yyyy, hh:mm a')}
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{sale.note || '—'}</td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {showModal && <SaleModal onClose={() => setShowModal(false)} />}
      </AnimatePresence>
    </div>
  );
}
