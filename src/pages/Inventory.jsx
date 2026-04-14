import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Edit2, Trash2, AlertTriangle, X, Package, Filter } from 'lucide-react';
import { useApp } from '../context/AppContext';
import toast from 'react-hot-toast';

const CATEGORIES = ['Chairs', 'Tables', 'Beds', 'Sofas', 'Wardrobes', 'Other'];
const CAT_EMOJI = { Chairs: '🪑', Tables: '🪵', Beds: '🛏️', Sofas: '🛋️', Wardrobes: '🗄️', Other: '📦' };

const EMPTY_FORM = { name: '', category: 'Chairs', price: '', quantity: '', lowStockThreshold: '3', description: '' };

/* ─── Item Form Modal ────────────────────────────────────────────── */
function ItemModal({ item, onClose }) {
  const { dispatch } = useApp();
  const isEdit = !!item?.id;
  const [form, setForm] = useState(isEdit ? item : EMPTY_FORM);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.price || Number(form.price) <= 0) e.price = 'Enter a valid price';
    if (!form.quantity || Number(form.quantity) < 0) e.quantity = 'Enter a valid quantity';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = () => {
    if (!validate()) return;
    dispatch({ type: isEdit ? 'EDIT_ITEM' : 'ADD_ITEM', payload: { ...form } });
    toast.success(isEdit ? `"${form.name}" updated!` : `"${form.name}" added to inventory!`, {
      style: { background: '#2A1A10', color: '#FFDAB9', border: '1px solid rgba(244,164,96,0.3)', borderRadius: 10 },
    });
    onClose();
  };

  return (
    <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div className="modal" initial={{ scale: 0.92, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 30 }}
        transition={{ type: 'spring', stiffness: 320, damping: 26 }}>
        <div className="modal-header">
          <h2 className="modal-title">{isEdit ? '✏️ Edit Item' : '➕ Add New Item'}</h2>
          <button className="modal-close" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="modal-body">
          {/* Name */}
          <div className="form-group">
            <label className="form-label">Item Name *</label>
            <input className={`form-control ${errors.name ? 'border-red' : ''}`} placeholder="e.g. Royal Oak Chair"
              value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            {errors.name && <span style={{ color: '#dc2626', fontSize: '0.78rem' }}>{errors.name}</span>}
          </div>

          {/* Category */}
          <div className="form-group">
            <label className="form-label">Category</label>
            <select className="form-control" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>

          {/* Price & Qty */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Price (₹) *</label>
              <input className="form-control" type="number" min="0" placeholder="0.00"
                value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
              {errors.price && <span style={{ color: '#dc2626', fontSize: '0.78rem' }}>{errors.price}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Quantity *</label>
              <input className="form-control" type="number" min="0" placeholder="0"
                value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} />
              {errors.quantity && <span style={{ color: '#dc2626', fontSize: '0.78rem' }}>{errors.quantity}</span>}
            </div>
          </div>

          {/* Low stock threshold */}
          <div className="form-group">
            <label className="form-label">Low Stock Alert Threshold</label>
            <input className="form-control" type="number" min="1" placeholder="3"
              value={form.lowStockThreshold} onChange={e => setForm({ ...form, lowStockThreshold: e.target.value })} />
          </div>

          {/* Description */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Description (optional)</label>
            <textarea className="form-control" rows={2} placeholder="Brief item description..."
              value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={submit}>
            {isEdit ? 'Save Changes' : '+ Add Item'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Delete confirm modal ───────────────────────────────────────── */
function DeleteModal({ item, onClose }) {
  const { dispatch } = useApp();
  const confirm = () => {
    dispatch({ type: 'DELETE_ITEM', payload: item.id });
    toast.error(`"${item.name}" removed from inventory.`, {
      style: { background: '#2A1A10', color: '#FFDAB9', border: '1px solid rgba(244,164,96,0.3)', borderRadius: 10 },
    });
    onClose();
  };
  return (
    <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div className="modal" style={{ maxWidth: 400 }} initial={{ scale: 0.92 }} animate={{ scale: 1 }} exit={{ scale: 0.92 }}>
        <div className="modal-header">
          <h2 className="modal-title">🗑️ Delete Item</h2>
          <button className="modal-close" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="modal-body">
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Are you sure you want to delete <strong>"{item.name}"</strong>? This action cannot be undone.
          </p>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-danger" onClick={confirm}>Yes, Delete</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Inventory Page ─────────────────────────────────────────────── */
export default function Inventory() {
  const { state } = useApp();
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('All');
  const [filterStock, setFilterStock] = useState('All');
  const [modal, setModal] = useState(null); // null | 'add' | 'edit' | 'delete'
  const [selectedItem, setSelectedItem] = useState(null);

  const openAdd = () => { setSelectedItem(null); setModal('add'); };
  const openEdit = item => { setSelectedItem(item); setModal('edit'); };
  const openDelete = item => { setSelectedItem(item); setModal('delete'); };
  const closeModal = () => { setModal(null); setSelectedItem(null); };

  const filtered = useMemo(() => {
    return state.inventory.filter(item => {
      const matchSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.category.toLowerCase().includes(search.toLowerCase());
      const matchCat = filterCat === 'All' || item.category === filterCat;
      const matchStock = filterStock === 'All'
        || (filterStock === 'low' && item.quantity <= item.lowStockThreshold)
        || (filterStock === 'in' && item.quantity > item.lowStockThreshold)
        || (filterStock === 'out' && item.quantity === 0);
      return matchSearch && matchCat && matchStock;
    });
  }, [state.inventory, search, filterCat, filterStock]);

  const catKey = cat => cat.toLowerCase().replace(' ', '-');

  return (
    <div className="page-wrapper">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="page-title">Inventory</h1>
        <p className="page-subtitle">{state.inventory.length} items in stock · {state.inventory.reduce((a, i) => a + i.quantity, 0)} total units</p>
      </motion.div>

      {/* Toolbar */}
      <motion.div className="toolbar" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
        <div className="search-wrap">
          <Search size={15} className="search-icon" />
          <input className="search-input" placeholder="Search items or category…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <select className="form-control" style={{ width: 140 }} value={filterCat} onChange={e => setFilterCat(e.target.value)}>
          <option value="All">All Categories</option>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>

        <select className="form-control" style={{ width: 130 }} value={filterStock} onChange={e => setFilterStock(e.target.value)}>
          <option value="All">All Stock</option>
          <option value="in">In Stock</option>
          <option value="low">Low Stock</option>
          <option value="out">Out of Stock</option>
        </select>

        <button className="btn btn-primary" onClick={openAdd} style={{ marginLeft: 'auto' }}>
          <Plus size={16} /> Add Item
        </button>
      </motion.div>

      {/* Table */}
      <motion.div className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <div className="table-wrap" style={{ border: 'none' }}>
          {filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📦</div>
              <h3>No items found</h3>
              <p>Try adjusting your search or filters, or add a new item.</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>#</th><th>Item Name</th><th>Category</th>
                  <th>Price</th><th>Stock</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filtered.map((item, idx) => {
                    const isLow = item.quantity <= item.lowStockThreshold && item.quantity > 0;
                    const isOut = item.quantity === 0;
                    return (
                      <motion.tr key={item.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ delay: idx * 0.03 }}>
                        <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{idx + 1}</td>
                        <td>
                          <div style={{ fontWeight: 600, color: 'var(--primary-dark)' }}>
                            {CAT_EMOJI[item.category] || '📦'} {item.name}
                          </div>
                          {item.description && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{item.description}</div>}
                        </td>
                        <td>
                          <span className={`badge cat-${catKey(item.category)}`}>{item.category}</span>
                        </td>
                        <td style={{ fontWeight: 700, color: 'var(--primary)' }}>₹{Number(item.price).toLocaleString()}</td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <span style={{ fontWeight: 600 }}>{item.quantity} units</span>
                            <div className="progress-wrap">
                              <div className="progress-bar" style={{
                                width: `${Math.min(100, (item.quantity / Math.max(item.quantity, item.lowStockThreshold * 3)) * 100)}%`,
                                background: isOut ? '#dc2626' : isLow ? '#f59e0b' : 'var(--gradient-wood)',
                              }} />
                            </div>
                          </div>
                        </td>
                        <td>
                          {isOut
                            ? <span className="badge badge-danger">Out of Stock</span>
                            : isLow
                              ? <span className="badge badge-warning">⚠ Low Stock</span>
                              : <span className="badge badge-success">In Stock</span>
                          }
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <motion.button className="btn btn-secondary btn-icon btn-sm" whileHover={{ scale: 1.08 }} onClick={() => openEdit(item)} title="Edit">
                              <Edit2 size={14} />
                            </motion.button>
                            <motion.button className="btn btn-danger btn-icon btn-sm" whileHover={{ scale: 1.08 }} onClick={() => openDelete(item)} title="Delete">
                              <Trash2 size={14} />
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          )}
        </div>
      </motion.div>

      {/* Modals */}
      <AnimatePresence>
        {(modal === 'add' || modal === 'edit') && (
          <ItemModal item={modal === 'edit' ? selectedItem : null} onClose={closeModal} />
        )}
        {modal === 'delete' && selectedItem && (
          <DeleteModal item={selectedItem} onClose={closeModal} />
        )}
      </AnimatePresence>
    </div>
  );
}
