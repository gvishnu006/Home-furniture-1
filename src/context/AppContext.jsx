import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { format, isToday, isThisWeek, isThisMonth, parseISO, subDays } from 'date-fns';

const AppContext = createContext(null);

// ── Sample seed data ──────────────────────────────────────────────────────────
const SEED_INVENTORY = [
  { id: '1', name: 'Royal Oak Chair', category: 'Chairs', price: 4500, quantity: 12, lowStockThreshold: 3, description: 'Handcrafted solid oak dining chair', createdAt: new Date().toISOString() },
  { id: '2', name: 'Teak Dining Table', category: 'Tables', price: 18000, quantity: 5, lowStockThreshold: 2, description: '6-seater premium teak wood table', createdAt: new Date().toISOString() },
  { id: '3', name: 'King Size Bed Frame', category: 'Beds', price: 28000, quantity: 3, lowStockThreshold: 2, description: 'Solid rosewood king bed with storage', createdAt: new Date().toISOString() },
  { id: '4', name: 'L-Shape Sofa Set', category: 'Sofas', price: 42000, quantity: 2, lowStockThreshold: 1, description: 'Premium fabric 7-seater sofa', createdAt: new Date().toISOString() },
  { id: '5', name: 'Wardrobe 4-Door', category: 'Wardrobes', price: 22000, quantity: 4, lowStockThreshold: 2, description: 'Sliding mirror wardrobe in walnut finish', createdAt: new Date().toISOString() },
  { id: '6', name: 'Study Desk', category: 'Tables', price: 8500, quantity: 8, lowStockThreshold: 3, description: 'L-shaped study desk with drawers', createdAt: new Date().toISOString() },
  { id: '7', name: 'Bar Stool Set (2)', category: 'Chairs', price: 5500, quantity: 6, lowStockThreshold: 2, description: 'Adjustable height leather bar stools', createdAt: new Date().toISOString() },
  { id: '8', name: 'Coffee Table', category: 'Tables', price: 6200, quantity: 7, lowStockThreshold: 2, description: 'Round glass-top coffee table in iron frame', createdAt: new Date().toISOString() },
  { id: '9', name: 'Bookshelf 5-Tier', category: 'Other', price: 7800, quantity: 5, lowStockThreshold: 2, description: 'Open bookshelf in mango wood', createdAt: new Date().toISOString() },
  { id: '10', name: 'Rocking Chair', category: 'Chairs', price: 9800, quantity: 2, lowStockThreshold: 2, description: 'Traditional teak rocking chair', createdAt: new Date().toISOString() },
];

function generateSales() {
  const sales = [];
  const items = ['Royal Oak Chair', 'Teak Dining Table', 'Study Desk', 'Bar Stool Set (2)', 'Coffee Table', 'Bookshelf 5-Tier'];
  const cats = ['Chairs', 'Tables', 'Tables', 'Chairs', 'Tables', 'Other'];
  const prices = [4500, 18000, 8500, 5500, 6200, 7800];
  let id = 1;
  for (let d = 13; d >= 0; d--) {
    const count = Math.floor(Math.random() * 4) + 1;
    for (let j = 0; j < count; j++) {
      const idx = Math.floor(Math.random() * items.length);
      const qty = Math.floor(Math.random() * 3) + 1;
      sales.push({
        id: String(id++),
        itemName: items[idx],
        category: cats[idx],
        price: prices[idx],
        quantity: qty,
        total: prices[idx] * qty,
        soldAt: subDays(new Date(), d).toISOString(),
        note: '',
      });
    }
  }
  return sales;
}

const SEED_SALES = generateSales();

// ── Reducer ───────────────────────────────────────────────────────────────────
function reducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const item = { ...action.payload, id: Date.now().toString(), createdAt: new Date().toISOString(), quantity: Number(action.payload.quantity), price: Number(action.payload.price) };
      return { ...state, inventory: [...state.inventory, item] };
    }
    case 'EDIT_ITEM': {
      return {
        ...state,
        inventory: state.inventory.map(i => i.id === action.payload.id
          ? { ...action.payload, quantity: Number(action.payload.quantity), price: Number(action.payload.price) }
          : i)
      };
    }
    case 'DELETE_ITEM': {
      return { ...state, inventory: state.inventory.filter(i => i.id !== action.payload) };
    }
    case 'RECORD_SALE': {
      const { itemId, quantity, note } = action.payload;
      const item = state.inventory.find(i => i.id === itemId);
      if (!item || item.quantity < quantity) return state;
      const sale = {
        id: Date.now().toString(),
        itemName: item.name,
        category: item.category,
        price: item.price,
        quantity: Number(quantity),
        total: item.price * Number(quantity),
        soldAt: new Date().toISOString(),
        note: note || '',
      };
      return {
        ...state,
        inventory: state.inventory.map(i => i.id === itemId ? { ...i, quantity: i.quantity - Number(quantity) } : i),
        sales: [sale, ...state.sales],
      };
    }
    case 'LOAD':
      return action.payload;
    default:
      return state;
  }
}

// ── Provider ──────────────────────────────────────────────────────────────────
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, { inventory: [], sales: [] }, () => {
    try {
      const saved = localStorage.getItem('woodcraft_data');
      if (saved) return JSON.parse(saved);
    } catch {}
    return { inventory: SEED_INVENTORY, sales: SEED_SALES };
  });

  useEffect(() => {
    try { localStorage.setItem('woodcraft_data', JSON.stringify(state)); } catch {}
  }, [state]);

  // ── Computed stats ──────────────────────────────────────────────────────────
  const stats = useCallback(() => {
    const today = state.sales.filter(s => isToday(parseISO(s.soldAt)));
    const todayAdded = state.inventory.filter(i => isToday(parseISO(i.createdAt)));
    const totalStock = state.inventory.reduce((a, i) => a + i.quantity, 0);
    const totalItems = state.inventory.length;
    const soldToday = today.reduce((a, s) => a + s.quantity, 0);
    const revenueToday = today.reduce((a, s) => a + s.total, 0);
    const lowStock = state.inventory.filter(i => i.quantity <= i.lowStockThreshold);
    return { totalItems, soldToday, addedToday: todayAdded.length, totalStock, revenueToday, lowStock };
  }, [state]);

  // ── Daily sales for line chart (last 14 days) ───────────────────────────────
  const dailySales = useCallback(() => {
    const days = Array.from({ length: 14 }, (_, i) => {
      const d = subDays(new Date(), 13 - i);
      const label = format(d, 'MMM d');
      const daySales = state.sales.filter(s => format(parseISO(s.soldAt), 'yyyy-MM-dd') === format(d, 'yyyy-MM-dd'));
      return { name: label, sold: daySales.reduce((a, s) => a + s.quantity, 0), revenue: daySales.reduce((a, s) => a + s.total, 0) };
    });
    return days;
  }, [state.sales]);

  // ── Category distribution ────────────────────────────────────────────────────
  const categoryDist = useCallback(() => {
    const map = {};
    state.inventory.forEach(i => { map[i.category] = (map[i.category] || 0) + i.quantity; });
    const colors = { Chairs: '#8B4513', Tables: '#D2691E', Beds: '#3B82F6', Sofas: '#8B5CF6', Wardrobes: '#10B981', Other: '#9CA3AF' };
    return Object.entries(map).map(([name, value]) => ({ name, value, fill: colors[name] || '#9CA3AF' }));
  }, [state.inventory]);

  // ── Weekly added vs sold ─────────────────────────────────────────────────────
  const addedVsSold = useCallback(() => {
    const weeks = Array.from({ length: 7 }, (_, i) => {
      const d = subDays(new Date(), 6 - i);
      const label = format(d, 'EEE');
      const added = state.inventory.filter(inv => format(parseISO(inv.createdAt), 'yyyy-MM-dd') === format(d, 'yyyy-MM-dd')).length;
      const sold = state.sales.filter(s => format(parseISO(s.soldAt), 'yyyy-MM-dd') === format(d, 'yyyy-MM-dd')).reduce((a, s) => a + s.quantity, 0);
      return { name: label, added, sold };
    });
    return weeks;
  }, [state]);

  // ── Filtered sales by period ─────────────────────────────────────────────────
  const salesByPeriod = useCallback((period) => {
    return state.sales.filter(s => {
      const d = parseISO(s.soldAt);
      if (period === 'daily') return isToday(d);
      if (period === 'weekly') return isThisWeek(d, { weekStartsOn: 1 });
      if (period === 'monthly') return isThisMonth(d);
      return true;
    });
  }, [state.sales]);

  return (
    <AppContext.Provider value={{ state, dispatch, stats, dailySales, categoryDist, addedVsSold, salesByPeriod }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
}
