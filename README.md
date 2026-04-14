# 🪵 WoodCraft Pro — Quick Start

## Run the App

Open a terminal inside `c:\Users\ADMIN\Desktop\Furniture\` and run:

```bash
npm install
npm run dev
```

Then open your browser at: **http://localhost:5173**

---

## Project Structure

```
Furniture/
├── index.html                  → Entry HTML
├── package.json                → Dependencies
├── vite.config.js              → Vite config
├── public/
│   └── favicon.svg
└── src/
    ├── main.jsx                → React root
    ├── App.jsx                 → Router + layout
    ├── index.css               → Full design system (wood theme)
    ├── context/
    │   └── AppContext.jsx      → Global state (inventory + sales)
    ├── components/
    │   ├── Navigation.jsx      → Sidebar + mobile drawer
    │   └── TopBar.jsx          → Top header bar
    └── pages/
        ├── Home.jsx            → Animated hero + landing
        ├── Dashboard.jsx       → Stats + live charts
        ├── Inventory.jsx       → CRUD table + modals
        ├── Sales.jsx           → Record sales + PDF export
        └── Analytics.jsx       → Full analytics suite
```

## Pages

| Page | Route | Description |
|------|-------|-------------|
| **Home** | `/` | Animated hero, category grid, feature cards |
| **Dashboard** | `/dashboard` | KPI cards, line/pie/bar charts, low stock alerts |
| **Inventory** | `/inventory` | Add/edit/delete items, search + filter |
| **Sales** | `/sales` | Record sales, daily/weekly/monthly view, PDF download |
| **Analytics** | `/analytics` | Area + radar + top sellers + revenue breakdown |
