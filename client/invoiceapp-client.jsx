import { useState, useEffect, useRef, useCallback } from "react";

// -- CONSTANTS & HELPERS -------------------------------------------------------
const CURRENCIES = ["USD", "GBP", "EUR", "CAD", "AUD", "NGN"];
const CURRENCY_NAMES = {
  USD: "US Dollar",
  GBP: "British Pound",
  EUR: "Euro",
  CAD: "Canadian Dollar",
  AUD: "Australian Dollar",
  NGN: "Nigerian Naira",
};
const MOCK_RATES = {
  USD: 1618.5,
  GBP: 2039.2,
  EUR: 1746.8,
  CAD: 1191.4,
  AUD: 1043.7,
  NGN: 1,
};
const STATUS_META = {
  draft: { label: "Draft", color: "gray", dot: "#94a3b8" },
  sent: { label: "Sent", color: "blue", dot: "#3b82f6" },
  viewed: { label: "Viewed", color: "purple", dot: "#8b5cf6" },
  overdue: { label: "Overdue", color: "red", dot: "#ef4444" },
  paid: { label: "Paid", color: "green", dot: "#16a34a" },
  cancelled: { label: "Cancelled", color: "gray", dot: "#94a3b8" },
  disputed: { label: "Disputed", color: "amber", dot: "#f59e0b" },
  partial: { label: "Partial", color: "teal", dot: "#0d9488" },
};
const TAX_TYPES = [
  { id: "vat", label: "VAT", default: 7.5 },
  { id: "wht", label: "WHT (Withholding Tax)", default: 5 },
  { id: "custom", label: "Custom", default: 10 },
];
const PAYMENT_TERMS_PRESETS = [
  "Due on receipt",
  "Net 7",
  "Net 14",
  "Net 30",
  "Net 60",
  "50% upfront, 50% on delivery",
];
const INVOICE_TYPES = [
  { id: "standard", label: "Standard Invoice" },
  { id: "proforma", label: "Proforma Invoice" },
  { id: "deposit", label: "Deposit Invoice" },
  { id: "credit", label: "Credit Note" },
];

const csym = (c) =>
  ({
    USD: "$",
    GBP: "\u00a3",
    EUR: "\u20ac",
    CAD: "C$",
    AUD: "A$",
    NGN: "\u20a6",
  }[c] || "$");
const fmt = (n, d = 2) =>
  parseFloat(n || 0).toLocaleString("en", {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  });
const fmtNGN = (n) =>
  parseFloat(n || 0).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const uid = () =>
  "INV-" +
  new Date().getFullYear() +
  "-" +
  String(Math.floor(Math.random() * 9000 + 1000));
const linkId = () => Math.random().toString(36).substr(2, 10);
const ts = () =>
  new Date().toLocaleString("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
const dateStr = (d) =>
  new Date(d).toLocaleDateString("en-NG", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
const isOverdue = (inv) =>
  inv.dueDate &&
  new Date(inv.dueDate) < new Date() &&
  !["paid", "cancelled", "draft"].includes(inv.status);
const subtotal = (items) =>
  items.reduce(
    (s, i) => s + (parseFloat(i.price) || 0) * (parseInt(i.qty) || 1),
    0
  );

const DEMO_CLIENTS = [
  {
    id: "c1",
    name: "Acme Corp",
    email: "billing@acmecorp.io",
    address: "123 Main St, San Francisco, CA",
  },
  {
    id: "c2",
    name: "TechFlow Inc",
    email: "ap@techflow.com",
    address: "456 Market Ave, New York, NY",
  },
  {
    id: "c3",
    name: "Meridian Labs",
    email: "finance@meridianlabs.io",
    address: "789 Tech Blvd, Austin, TX",
  },
  {
    id: "c4",
    name: "Lumen Creative",
    email: "accounts@lumencreative.co",
    address: "101 Design St, London, UK",
  },
];
const DEMO_TEMPLATES = [
  {
    id: "t1",
    name: "Web Development",
    items: [
      { desc: "Frontend Development", qty: 1, price: "" },
      { desc: "Backend API Integration", qty: 1, price: "" },
    ],
  },
  {
    id: "t2",
    name: "Design Package",
    items: [
      { desc: "UI/UX Design", qty: 1, price: "" },
      { desc: "Brand Assets", qty: 1, price: "" },
    ],
  },
  {
    id: "t3",
    name: "Content Writing",
    items: [
      { desc: "Blog Articles", qty: 4, price: "" },
      { desc: "SEO Optimization", qty: 1, price: "" },
    ],
  },
];
const DEMO_INVOICES = [
  {
    id: "INV-2026-0041",
    linkId: "ax9k2m1pqw",
    client: { name: "Meridian Labs", email: "finance@meridianlabs.io" },
    type: "standard",
    currency: "USD",
    items: [{ desc: "Full-Stack Development - Sprint 3", qty: 1, price: 2400 }],
    tax: { type: "vat", rate: 7.5 },
    taxAmt: 180,
    deposit: 0,
    total: 2580,
    status: "paid",
    created: "2026-03-18",
    dueDate: "2026-04-01",
    paid: "2026-03-22",
    notes: "",
    terms: "Net 14",
    ngn: 4180050,
    events: [
      { type: "created", ts: "Mar 18, 2026 9:00am" },
      { type: "sent", ts: "Mar 18, 2026 9:05am" },
      { type: "viewed", ts: "Mar 19, 2026 2:14pm" },
      { type: "viewed", ts: "Mar 20, 2026 10:30am" },
      { type: "downloaded", ts: "Mar 20, 2026 10:32am" },
      { type: "paid", ts: "Mar 22, 2026 3:00pm" },
    ],
  },
  {
    id: "INV-2026-0040",
    linkId: "bz8j3n4rty",
    client: { name: "Lumen Creative", email: "accounts@lumencreative.co" },
    type: "standard",
    currency: "USD",
    items: [{ desc: "Brand Identity Package", qty: 1, price: 850 }],
    tax: null,
    taxAmt: 0,
    deposit: 0,
    total: 850,
    status: "overdue",
    created: "2026-03-16",
    dueDate: "2026-03-23",
    paid: null,
    notes: "Final deliverables shared on March 15.",
    terms: "Net 7",
    ngn: null,
    events: [
      { type: "created", ts: "Mar 16, 2026 11:00am" },
      { type: "sent", ts: "Mar 16, 2026 11:10am" },
      { type: "viewed", ts: "Mar 17, 2026 9:45am" },
    ],
  },
  {
    id: "INV-2026-0039",
    linkId: "cy7i4o5uyz",
    client: { name: "Vance & Co", email: "ap@vanceandco.com" },
    type: "deposit",
    currency: "USD",
    items: [
      { desc: "SEO Audit & Strategy", qty: 1, price: 900 },
      { desc: "Implementation Guide", qty: 1, price: 200 },
    ],
    tax: { type: "vat", rate: 7.5 },
    taxAmt: 82.5,
    deposit: 50,
    total: 541.25,
    status: "sent",
    created: "2026-03-14",
    dueDate: "2026-03-28",
    paid: null,
    notes: "50% deposit invoice. Remaining balance due on project completion.",
    terms: "Net 14",
    ngn: null,
    events: [
      { type: "created", ts: "Mar 14, 2026 2:00pm" },
      { type: "sent", ts: "Mar 14, 2026 2:15pm" },
    ],
  },
  {
    id: "INV-2026-0038",
    linkId: "dw6h5p6vab",
    client: { name: "Acme Corp", email: "billing@acmecorp.io" },
    type: "standard",
    currency: "USD",
    items: [{ desc: "UI/UX Design - Brand Refresh", qty: 1, price: 1200 }],
    tax: null,
    taxAmt: 0,
    deposit: 0,
    total: 1200,
    status: "paid",
    created: "2026-03-10",
    dueDate: "2026-03-24",
    paid: "2026-03-12",
    notes: "",
    terms: "Net 14",
    ngn: 1944600,
    events: [
      { type: "created", ts: "Mar 10, 2026 10:00am" },
      { type: "sent", ts: "Mar 10, 2026 10:05am" },
      { type: "viewed", ts: "Mar 11, 2026 1:00pm" },
      { type: "paid", ts: "Mar 12, 2026 9:00am" },
    ],
  },
  {
    id: "INV-2026-0037",
    linkId: "ev5g6q7wcd",
    client: { name: "TechFlow Inc", email: "ap@techflow.com" },
    type: "standard",
    currency: "USD",
    items: [{ desc: "API Integration (Phase 2)", qty: 1, price: 800 }],
    tax: null,
    taxAmt: 0,
    deposit: 0,
    total: 800,
    status: "draft",
    created: "2026-03-20",
    dueDate: "2026-04-03",
    paid: null,
    notes: "",
    terms: "Net 14",
    ngn: null,
    events: [{ type: "created", ts: "Mar 20, 2026 4:00pm" }],
  },
];

// -- ICONS ---------------------------------------------------------------------
const Icon = ({ n, s = 16, c = "currentColor", st = {} }) => {
  const p = {
    width: s,
    height: s,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: c,
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    style: st,
  };
  const d = {
    grid: (
      <svg {...p}>
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
    file: (
      <svg {...p}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
    plus: (
      <svg {...p} strokeWidth="2">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    ),
    trash: (
      <svg {...p}>
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
      </svg>
    ),
    eye: (
      <svg {...p}>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
    copy: (
      <svg {...p}>
        <rect x="9" y="9" width="13" height="13" rx="2" />
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
      </svg>
    ),
    check: (
      <svg {...p} strokeWidth="2.5">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
    chevL: (
      <svg {...p} strokeWidth="2">
        <polyline points="15 18 9 12 15 6" />
      </svg>
    ),
    chevR: (
      <svg {...p} strokeWidth="2">
        <polyline points="9 18 15 12 9 6" />
      </svg>
    ),
    chevD: (
      <svg {...p} strokeWidth="2">
        <polyline points="6 9 12 15 18 9" />
      </svg>
    ),
    spin: (
      <svg
        {...p}
        strokeWidth="2"
        style={{ ...st, animation: "spin 1s linear infinite" }}
      >
        <line x1="12" y1="2" x2="12" y2="6" />
        <line x1="12" y1="18" x2="12" y2="22" />
        <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
        <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
        <line x1="2" y1="12" x2="6" y2="12" />
        <line x1="18" y1="12" x2="22" y2="12" />
        <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
        <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
      </svg>
    ),
    send: (
      <svg {...p}>
        <line x1="22" y1="2" x2="11" y2="13" />
        <polygon points="22 2 15 22 11 13 2 9 22 2" />
      </svg>
    ),
    download: (
      <svg {...p}>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
    ),
    share: (
      <svg {...p}>
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
      </svg>
    ),
    link: (
      <svg {...p}>
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
    ),
    mail: (
      <svg {...p}>
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
    bell: (
      <svg {...p}>
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
    settings: (
      <svg {...p}>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
    menu: (
      <svg {...p}>
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="18" x2="21" y2="18" />
      </svg>
    ),
    close: (
      <svg {...p}>
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    ),
    clock: (
      <svg {...p}>
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    zap: (
      <svg {...p}>
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
    alert: (
      <svg {...p}>
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
    trending: (
      <svg {...p}>
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
      </svg>
    ),
    refresh: (
      <svg {...p}>
        <polyline points="23 4 23 10 17 10" />
        <path d="M20.49 15a9 9 0 1 1-.08-7.96" />
      </svg>
    ),
    users: (
      <svg {...p}>
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    template: (
      <svg {...p}>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18M9 21V9" />
      </svg>
    ),
    dollar: (
      <svg {...p}>
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
    percent: (
      <svg {...p}>
        <line x1="19" y1="5" x2="5" y2="19" />
        <circle cx="6.5" cy="6.5" r="2.5" />
        <circle cx="17.5" cy="17.5" r="2.5" />
      </svg>
    ),
    activity: (
      <svg {...p}>
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    edit: (
      <svg {...p}>
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
    ),
    inbox: (
      <svg {...p}>
        <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
        <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
      </svg>
    ),
    star: (
      <svg {...p}>
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
    tag: (
      <svg {...p}>
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
        <line x1="7" y1="7" x2="7.01" y2="7" />
      </svg>
    ),
    whatsapp: (
      <svg {...p}>
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
      </svg>
    ),
  };
  return d[n] || null;
};

// -- STYLES --------------------------------------------------------------------
const S = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&family=DM+Mono:wght@400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#f4f6f4;--sf:#fff;--sf2:#f0f4f1;--sf3:#e8f0e9;
  --bd:#dde8de;--bd2:#c8d9ca;
  --g:#16a34a;--glt:#dcfce7;--gdk:#14532d;--gmid:#86efac;
  --tx:#111d13;--tx2:#4a6350;--tx3:#8aab90;
  --am:#d97706;--amlt:#fef3c7;
  --rd:#dc2626;--rdlt:#fee2e2;
  --bl:#2563eb;--bllt:#dbeafe;
  --pu:#7c3aed;--pult:#ede9fe;
  --te:#0d9488;--telt:#ccfbf1;
  --r:10px;--rl:14px;--fn:'DM Sans',sans-serif;--mo:'DM Mono',monospace;
  --sh:0 1px 3px rgba(0,0,0,.06),0 1px 2px rgba(0,0,0,.04);
  --shm:0 4px 16px rgba(0,0,0,.09),0 2px 4px rgba(0,0,0,.05);
  --shl:0 8px 32px rgba(0,0,0,.12),0 4px 8px rgba(0,0,0,.06);
}
html,body,#root{height:100%;overflow:hidden}
body{font-family:var(--fn);background:var(--bg);color:var(--tx);font-size:14px;line-height:1.55}
.app{display:flex;height:100vh;overflow:hidden}

/* SIDEBAR */
.sb{width:236px;flex-shrink:0;background:var(--sf);border-right:1px solid var(--bd);display:flex;flex-direction:column;z-index:200;transition:transform .22s ease}
.sb-top{padding:16px 18px 12px;border-bottom:1px solid var(--bd);display:flex;align-items:center;gap:10px;flex-shrink:0}
.sb-mark{width:32px;height:32px;border-radius:9px;background:var(--g);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:800;color:#fff;flex-shrink:0}
.sb-name{font-size:15px;font-weight:800;color:var(--tx);letter-spacing:-.03em}
.sb-ver{font-size:9px;color:var(--tx3);font-weight:500;letter-spacing:.04em;text-transform:uppercase}
.sb-close{display:none;margin-left:auto;background:none;border:none;color:var(--tx3);cursor:pointer;padding:2px}
.sb-sec{padding:8px 10px 4px;font-size:10px;font-weight:700;color:var(--tx3);text-transform:uppercase;letter-spacing:.08em}
.sb-nav{flex:1;overflow-y:auto;padding:8px 10px;display:flex;flex-direction:column;gap:1px}
.ni{display:flex;align-items:center;gap:9px;padding:8px 12px;border-radius:9px;font-size:13px;font-weight:500;color:var(--tx2);cursor:pointer;transition:all .12s;border:none;background:none;width:100%;text-align:left;font-family:var(--fn)}
.ni:hover{background:var(--sf2);color:var(--tx)}
.ni.on{background:var(--glt);color:var(--gdk);font-weight:600}
.ni.on svg{stroke:var(--gdk)}
.ni-badge{margin-left:auto;background:var(--rd);color:#fff;border-radius:20px;font-size:10px;font-weight:700;padding:1px 7px;min-width:20px;text-align:center}
.sb-div{height:1px;background:var(--bd);margin:6px 4px}
.sb-user{padding:12px 16px;border-top:1px solid var(--bd);flex-shrink:0;display:flex;align-items:center;gap:10px}
.av{width:32px;height:32px;border-radius:50%;background:var(--g);color:#fff;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0}
.av-name{font-size:12px;font-weight:600;color:var(--tx)}
.av-plan{font-size:10px;color:var(--tx3)}
.overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.35);z-index:190;backdrop-filter:blur(2px)}

/* MAIN */
.main{flex:1;overflow-y:auto;overflow-x:hidden;min-width:0;background:var(--bg)}
.topbar{display:none;align-items:center;justify-content:space-between;padding:12px 16px;background:var(--sf);border-bottom:1px solid var(--bd);position:sticky;top:0;z-index:50}
.tb-logo{display:flex;align-items:center;gap:8px}
.tb-btn{background:none;border:none;color:var(--tx2);cursor:pointer;padding:4px;display:flex}
.pg{padding:24px 24px 60px;max-width:1100px}
.pg-hd{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap;margin-bottom:24px}
.pg-ttl{font-size:20px;font-weight:700;color:var(--tx);letter-spacing:-.03em}
.pg-sub{font-size:13px;color:var(--tx3);margin-top:2px}

/* CARDS */
.card{background:var(--sf);border:1px solid var(--bd);border-radius:var(--rl);padding:20px;box-shadow:var(--sh)}
.card-ttl{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--tx3);margin-bottom:14px}

/* STATS */
.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:24px}
.stat{background:var(--sf);border:1px solid var(--bd);border-radius:var(--rl);padding:16px 18px;box-shadow:var(--sh)}
.stat-lbl{font-size:11px;font-weight:600;color:var(--tx3);text-transform:uppercase;letter-spacing:.07em;margin-bottom:5px}
.stat-val{font-size:22px;font-weight:700;color:var(--tx);letter-spacing:-.04em;font-family:var(--mo)}
.stat-meta{font-size:12px;color:var(--tx3);margin-top:3px}

/* TABLE */
.tcard{background:var(--sf);border:1px solid var(--bd);border-radius:var(--rl);overflow:hidden;box-shadow:var(--sh)}
.tcard-hd{display:flex;justify-content:space-between;align-items:center;padding:14px 18px;border-bottom:1px solid var(--bd);gap:10px;flex-wrap:wrap}
.tcard-ttl{font-size:14px;font-weight:700;color:var(--tx)}
.tscroll{overflow-x:auto;-webkit-overflow-scrolling:touch}
table{width:100%;border-collapse:collapse;min-width:560px}
th{padding:9px 16px;text-align:left;font-size:10px;font-weight:700;color:var(--tx3);text-transform:uppercase;letter-spacing:.07em;background:var(--sf2);border-bottom:1px solid var(--bd);white-space:nowrap}
td{padding:12px 16px;font-size:13px;color:var(--tx2);border-bottom:1px solid var(--bd)}
tr:last-child td{border-bottom:none}
tr:hover td{background:#f8fbf8;cursor:pointer}
.t-id{font-family:var(--mo);font-size:12px;color:var(--gdk);font-weight:600}
.t-client{font-weight:600;color:var(--tx)}
.t-email{font-size:11px;color:var(--tx3)}
.t-amt{font-family:var(--mo);font-weight:600;color:var(--tx)}
.t-ngn{font-family:var(--mo);font-size:11px;color:var(--tx3)}

/* BADGES */
.badge{display:inline-flex;align-items:center;gap:4px;padding:3px 9px;border-radius:20px;font-size:11px;font-weight:600;white-space:nowrap}
.b-green{background:var(--glt);color:var(--gdk)}
.b-blue{background:var(--bllt);color:var(--bl)}
.b-red{background:var(--rdlt);color:var(--rd)}
.b-amber{background:var(--amlt);color:var(--am)}
.b-purple{background:var(--pult);color:var(--pu)}
.b-gray{background:var(--sf2);color:var(--tx2);border:1px solid var(--bd)}
.b-teal{background:var(--telt);color:var(--te)}
.bdot{width:5px;height:5px;border-radius:50%;background:currentColor;flex-shrink:0}

/* BUTTONS */
.btn{display:inline-flex;align-items:center;gap:7px;padding:9px 16px;border-radius:9px;font-size:13px;font-weight:600;cursor:pointer;transition:all .12s;border:none;font-family:var(--fn);white-space:nowrap;flex-shrink:0;line-height:1.2}
.bp{background:var(--g);color:#fff;box-shadow:0 1px 4px rgba(22,163,74,.3)}.bp:hover{background:#15803d}
.bs{background:var(--sf);color:var(--tx2);border:1.5px solid var(--bd)}.bs:hover{border-color:var(--bd2);color:var(--tx)}
.bg{background:transparent;color:var(--tx3);border:1.5px solid var(--bd)}.bg:hover{color:var(--tx2);border-color:var(--bd2)}
.bd{background:var(--rdlt);color:var(--rd);border:1.5px solid #fca5a5}.bd:hover{background:#fecaca}
.btn:disabled{opacity:.4;cursor:not-allowed}
.btn-sm{padding:6px 12px;font-size:12px;gap:5px}
.btn-lg{padding:13px 22px;font-size:14px}
.btn-full{width:100%;justify-content:center}
.row{display:flex;align-items:center;gap:8px;flex-wrap:wrap}

/* FORM */
.fgrid{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.full{grid-column:1/-1}
.fg{margin-bottom:0}
label{display:block;font-size:11px;font-weight:700;color:var(--tx3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:5px}
input,select,textarea{width:100%;padding:10px 12px;background:var(--sf);border:1.5px solid var(--bd);border-radius:9px;color:var(--tx);font-size:13px;font-family:var(--fn);transition:border-color .15s,box-shadow .15s;outline:none}
input:focus,select:focus,textarea:focus{border-color:var(--g);box-shadow:0 0 0 3px rgba(22,163,74,.1)}
input::placeholder,textarea::placeholder{color:var(--tx3)}
select option{background:#fff}
.ipw{position:relative}
.ipp{position:absolute;left:12px;top:50%;transform:translateY(-50%);font-size:13px;color:var(--tx3);font-family:var(--mo);pointer-events:none}
.ipw input{padding-left:26px}

/* LINE ITEMS */
.li-wrap{border:1.5px solid var(--bd);border-radius:var(--r);overflow:hidden}
.li-hd{display:grid;grid-template-columns:1fr 60px 96px 80px 30px;gap:8px;padding:8px 12px;background:var(--sf2);font-size:10px;font-weight:700;color:var(--tx3);text-transform:uppercase;letter-spacing:.06em}
.li-row{display:grid;grid-template-columns:1fr 60px 96px 80px 30px;gap:8px;padding:8px 12px;border-top:1px solid var(--bd);align-items:center}
.li-row input{padding:7px 9px;font-size:13px;border-radius:7px}
.li-ft{display:flex;justify-content:space-between;align-items:center;padding:10px 14px;background:var(--sf2);border-top:1px solid var(--bd);font-size:13px;color:var(--tx2)}
.li-total{font-weight:700;color:var(--tx);font-family:var(--mo)}
.totals-box{background:var(--sf2);border-radius:var(--r);padding:12px 16px;margin-top:14px}
.tot-row{display:flex;justify-content:space-between;font-size:13px;padding:4px 0}
.tot-row.final{border-top:1.5px solid var(--bd);margin-top:6px;padding-top:10px;font-weight:700;font-size:15px;color:var(--tx)}

/* INVOICE PREVIEW CARD */
.inv-card{background:var(--sf);border:1px solid var(--bd);border-radius:16px;overflow:hidden;box-shadow:var(--shl);max-width:520px;width:100%}
.inv-hd{background:linear-gradient(155deg,#14532d 0%,#16a34a 100%);padding:26px;color:#fff;position:relative;overflow:hidden}
.inv-hd::after{content:'';position:absolute;right:-40px;top:-40px;width:140px;height:140px;border-radius:50%;background:rgba(255,255,255,.05)}
.inv-hd-badge{display:inline-flex;align-items:center;gap:5px;background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.22);border-radius:20px;padding:4px 11px;font-size:10px;font-weight:700;letter-spacing:.05em;margin-bottom:14px;position:relative;z-index:1}
.inv-hd-from{font-size:19px;font-weight:800;letter-spacing:-.02em;margin-bottom:3px;position:relative;z-index:1}
.inv-hd-biz{font-size:12px;opacity:.72;position:relative;z-index:1}
.inv-hd-div{height:1px;background:rgba(255,255,255,.18);margin:16px 0;position:relative;z-index:1}
.inv-hd-lbl{font-size:10px;opacity:.6;font-weight:600;text-transform:uppercase;letter-spacing:.07em;margin-bottom:4px;position:relative;z-index:1}
.inv-hd-amt{font-size:38px;font-weight:800;font-family:var(--mo);letter-spacing:-.04em;position:relative;z-index:1}
.inv-hd-ngn{font-size:14px;opacity:.78;font-family:var(--mo);margin-top:5px;position:relative;z-index:1}
.inv-body{padding:22px}
.inv-row{display:flex;justify-content:space-between;align-items:flex-start;padding:8px 0;border-bottom:1px solid var(--bd)}
.inv-row:last-child{border-bottom:none}
.inv-l{font-size:12px;color:var(--tx3);font-weight:500}
.inv-v{font-size:12px;color:var(--tx);font-weight:600;text-align:right;max-width:60%}
.inv-items{background:var(--sf2);border-radius:8px;padding:12px;margin:12px 0}
.ii-row{display:flex;justify-content:space-between;font-size:12px;padding:5px 0;color:var(--tx2);border-bottom:1px dashed var(--bd)}
.ii-row:last-of-type{border-bottom:none}
.ii-sub{font-size:11px;color:var(--tx3);margin-top:1px}
.ii-tot{display:flex;justify-content:space-between;font-size:13px;font-weight:700;color:var(--tx);padding-top:8px;margin-top:6px;border-top:1.5px solid var(--bd)}
.inv-stamp{display:flex;align-items:center;gap:10px;padding:14px 20px;background:var(--sf2);border-top:1.5px solid var(--bd)}
.inv-stamp-dot{width:8px;height:8px;border-radius:50%;background:var(--g);flex-shrink:0}

/* TIMELINE */
.timeline{display:flex;flex-direction:column;gap:0}
.tl-item{display:flex;gap:12px;padding:10px 0;position:relative}
.tl-item:not(:last-child)::after{content:'';position:absolute;left:11px;top:38px;width:1.5px;height:calc(100% - 14px);background:var(--bd)}
.tl-dot{width:23px;height:23px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;z-index:1;border:1.5px solid var(--bd);background:var(--sf)}
.tl-dot.done{background:var(--glt);border-color:var(--gmid)}
.tl-dot.active{background:var(--bllt);border-color:#93c5fd}
.tl-lbl{font-size:13px;font-weight:500;color:var(--tx2);padding-top:2px}
.tl-ts{font-size:11px;color:var(--tx3);margin-top:1px}

/* ACTIVITY FEED */
.af-item{display:flex;gap:10px;padding:8px 0;border-bottom:1px solid var(--bd)}
.af-item:last-child{border-bottom:none}
.af-icon{width:28px;height:28px;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px}
.af-lbl{font-size:13px;color:var(--tx);font-weight:500}
.af-sub{font-size:11px;color:var(--tx3);margin-top:2px}

/* TABS */
.tabs{display:flex;gap:2px;background:var(--sf2);border-radius:10px;padding:3px;margin-bottom:20px}
.tab{flex:1;text-align:center;padding:7px;border-radius:8px;font-size:12px;font-weight:500;color:var(--tx3);cursor:pointer;transition:all .12s;border:none;background:none;font-family:var(--fn)}
.tab.on{background:var(--sf);color:var(--tx);box-shadow:var(--sh);font-weight:600}

/* MODAL */
.modal-bg{position:fixed;inset:0;background:rgba(0,0,0,.4);z-index:500;display:flex;align-items:center;justify-content:center;padding:16px;backdrop-filter:blur(2px)}
.modal{background:var(--sf);border-radius:16px;padding:24px;max-width:480px;width:100%;box-shadow:var(--shl);max-height:90vh;overflow-y:auto}
.modal-ttl{font-size:16px;font-weight:700;color:var(--tx);margin-bottom:4px}
.modal-sub{font-size:13px;color:var(--tx3);margin-bottom:20px}

/* CLIENT PICKER */
.client-item{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:var(--r);cursor:pointer;transition:all .12s;border:1.5px solid transparent}
.client-item:hover{background:var(--sf2)}
.client-item.sel{background:var(--glt);border-color:var(--gmid)}

/* MISC */
.divrow{display:flex;align-items:center;gap:8px;margin:16px 0}
.divrow span{font-size:11px;color:var(--tx3);white-space:nowrap;text-transform:uppercase;letter-spacing:.06em}
.divrow::before,.divrow::after{content:'';flex:1;height:1px;background:var(--bd)}
.lbox{background:var(--sf2);border:1.5px solid var(--bd);border-radius:9px;padding:10px 13px;display:flex;align-items:center;gap:9px}
.lurl{font-family:var(--mo);font-size:11px;color:var(--gdk);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1;font-weight:500}
.empty{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:48px;color:var(--tx3);gap:10px;text-align:center}
.empty p{font-size:13px;max-width:220px;line-height:1.6}
.tag{display:inline-block;padding:2px 8px;border-radius:6px;font-size:11px;font-weight:600;background:var(--sf2);color:var(--tx2);border:1px solid var(--bd)}
.fade{animation:fi .2s ease}
@keyframes fi{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}}
@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
.mono{font-family:var(--mo)}
.fw{font-weight:600;color:var(--tx)}
.mb2{margin-bottom:8px}.mb3{margin-bottom:12px}.mb4{margin-bottom:16px}.mb6{margin-bottom:24px}
.mt2{margin-top:8px}.mt3{margin-top:12px}.mt4{margin-top:16px}
::-webkit-scrollbar{width:5px;height:5px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:var(--bd2);border-radius:3px}

/* RESPONSIVE */
@media(max-width:768px){
  .sb{position:fixed;top:0;left:0;bottom:0;transform:translateX(-100%)}
  .sb.open{transform:translateX(0)}
  .sb-close{display:flex}
  .overlay.open{display:block}
  .topbar{display:flex}
  .pg{padding:14px 12px 60px}
  .stats{grid-template-columns:1fr 1fr}
  .stats .stat:nth-child(3),.stats .stat:nth-child(4){grid-column:auto}
  .fgrid{grid-template-columns:1fr}
  .full{grid-column:1}
  .two-col{grid-template-columns:1fr!important}
  .li-hd,.li-row{grid-template-columns:1fr 50px 80px 30px;gap:5px}
  .li-hd span:nth-child(4),.li-row span:nth-child(4),.li-row .am-col{display:none}
}
@media(max-width:480px){
  .stats{grid-template-columns:1fr}
}
`;

// -- HELPERS -------------------------------------------------------------------
function statusBadge(status) {
  const m = STATUS_META[status] || STATUS_META.draft;
  const cls =
    {
      green: "b-green",
      blue: "b-blue",
      red: "b-red",
      amber: "b-amber",
      purple: "b-purple",
      gray: "b-gray",
      teal: "b-teal",
    }[m.color] || "b-gray";
  return (
    <span className={`badge ${cls}`}>
      <span className="bdot" />
      {m.label}
    </span>
  );
}
function typeBadge(type) {
  const m = {
    standard: { l: "Invoice", c: "b-gray" },
    proforma: { l: "Proforma", c: "b-blue" },
    deposit: { l: "Deposit", c: "b-purple" },
    credit: { l: "Credit Note", c: "b-teal" },
  };
  const t = m[type] || m.standard;
  return <span className={`badge ${t.c}`}>{t.l}</span>;
}
function calcTotal(items, tax, deposit) {
  const sub = subtotal(items);
  const taxAmt = tax ? (sub * tax.rate) / 100 : 0;
  const gross = sub + taxAmt;
  const dep = deposit ? (gross * deposit) / 100 : 0;
  return { sub, taxAmt, gross, dep, total: deposit ? dep : gross };
}

// -- TOAST ---------------------------------------------------------------------
function Toast({ msg, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, []);
  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 9999,
        background: "var(--tx)",
        color: "#fff",
        padding: "11px 18px",
        borderRadius: 10,
        fontSize: 13,
        fontWeight: 500,
        display: "flex",
        alignItems: "center",
        gap: 8,
        boxShadow: "0 8px 24px rgba(0,0,0,.2)",
        animation: "fi .2s ease",
      }}
    >
      <Icon n="check" s={15} c="#4ade80" />
      {msg}
    </div>
  );
}

// -- DASHBOARD -----------------------------------------------------------------
function Dashboard({ invoices, onNew, onView }) {
  const paid = invoices.filter((i) => i.status === "paid");
  const pending = invoices.filter((i) => ["sent", "viewed"].includes(i.status));
  const overdue = invoices.filter(
    (i) => i.status === "overdue" || isOverdue(i)
  );
  const draft = invoices.filter((i) => i.status === "draft");
  const totalEarned = paid.reduce((s, i) => s + i.total, 0);
  const outstanding = pending.reduce((s, i) => s + i.total, 0);
  const overdueAmt = overdue.reduce((s, i) => s + i.total, 0);

  const recentActivity = invoices
    .flatMap((inv) => (inv.events || []).map((e) => ({ ...e, inv })))
    .sort((a, b) => b.ts.localeCompare(a.ts))
    .slice(0, 6);

  const activityIcon = (type) =>
    ({
      created: ["tag", "b-gray"],
      sent: ["send", "b-blue"],
      viewed: ["eye", "b-purple"],
      downloaded: ["download", "b-gray"],
      paid: ["check", "b-green"],
      overdue: ["alert", "b-red"],
      cancelled: ["close", "b-gray"],
      disputed: ["alert", "b-amber"],
    }[type] || ["activity", "b-gray"]);

  return (
    <div className="pg fade">
      <div className="pg-hd">
        <div>
          <div className="pg-ttl">Dashboard</div>
          <div className="pg-sub">Welcome back, Lucky</div>
        </div>
        <button className="btn bp" onClick={onNew}>
          <Icon n="plus" s={14} c="#fff" />
          New Invoice
        </button>
      </div>
      <div className="stats mb6">
        <div className="stat">
          <div className="stat-lbl">Total Earned</div>
          <div className="stat-val">
            {"$"}
            {fmt(totalEarned, 0)}
          </div>
          <div className="stat-meta">{paid.length} paid invoices</div>
        </div>
        <div className="stat">
          <div className="stat-lbl">Outstanding</div>
          <div className="stat-val" style={{ color: "var(--bl)" }}>
            {"$"}
            {fmt(outstanding, 0)}
          </div>
          <div className="stat-meta">{pending.length} awaiting payment</div>
        </div>
        <div className="stat">
          <div className="stat-lbl">Overdue</div>
          <div
            className="stat-val"
            style={{ color: overdueAmt > 0 ? "var(--rd)" : "var(--tx)" }}
          >
            {"$"}
            {fmt(overdueAmt, 0)}
          </div>
          <div className="stat-meta">{overdue.length} invoices past due</div>
        </div>
        <div className="stat">
          <div className="stat-lbl">Drafts</div>
          <div className="stat-val">{draft.length}</div>
          <div className="stat-meta">not yet sent</div>
        </div>
      </div>

      <div
        className="two-col"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 300px",
          gap: 18,
          alignItems: "start",
        }}
      >
        <div>
          <div className="tcard">
            <div className="tcard-hd">
              <div className="tcard-ttl">Recent Invoices</div>
              <button className="btn bg btn-sm" onClick={onNew}>
                <Icon n="plus" s={12} />
                Create
              </button>
            </div>
            <div className="tscroll">
              <table>
                <thead>
                  <tr>
                    <th>Invoice</th>
                    <th>Client</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Due</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.slice(0, 8).map((inv) => (
                    <tr key={inv.id} onClick={() => onView(inv)}>
                      <td>
                        <div className="t-id">{inv.id}</div>
                        <div
                          style={{
                            fontSize: 11,
                            color: "var(--tx3)",
                            marginTop: 1,
                          }}
                        >
                          {typeBadge(inv.type)}
                        </div>
                      </td>
                      <td>
                        <div className="t-client">{inv.client.name}</div>
                        <div className="t-email">{inv.client.email}</div>
                      </td>
                      <td>
                        <div className="t-amt">
                          {csym(inv.currency)}
                          {fmt(inv.total)}
                        </div>
                        {inv.ngn && (
                          <div className="t-ngn">
                            {"\u20a6"}
                            {fmt(inv.ngn, 0)}
                          </div>
                        )}
                      </td>
                      <td>
                        {statusBadge(isOverdue(inv) ? "overdue" : inv.status)}
                      </td>
                      <td
                        style={{
                          fontSize: 12,
                          color: isOverdue(inv) ? "var(--rd)" : "var(--tx3)",
                        }}
                      >
                        {inv.dueDate || "-"}
                      </td>
                      <td>
                        <button
                          className="btn bg btn-sm"
                          style={{ padding: "5px 8px" }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onView(inv);
                          }}
                        >
                          <Icon n="eye" s={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div>
          <div className="card">
            <div className="card-ttl">Recent Activity</div>
            {recentActivity.length === 0 ? (
              <div style={{ fontSize: 13, color: "var(--tx3)" }}>
                No activity yet.
              </div>
            ) : (
              recentActivity.map((ev, i) => {
                const [ico, cls] = activityIcon(ev.type);
                return (
                  <div key={i} className="af-item">
                    <div className={`af-icon ${cls}`}>
                      <Icon n={ico} s={13} c="currentColor" />
                    </div>
                    <div>
                      <div className="af-lbl">{ev.inv.client.name}</div>
                      <div className="af-sub">
                        {ev.inv.id} {"\u00b7"} {ev.type} {"\u00b7"} {ev.ts}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// -- INVOICE LIST --------------------------------------------------------------
function InvoiceList({ invoices, onNew, onView }) {
  const [filter, setFilter] = useState("all");
  const filters = [
    ["all", "All"],
    ["draft", "Draft"],
    ["sent", "Sent"],
    ["viewed", "Viewed"],
    ["overdue", "Overdue"],
    ["paid", "Paid"],
  ];
  const counts = Object.fromEntries(
    filters.map(([k]) => [
      k,
      k === "all"
        ? invoices.length
        : invoices.filter((i) => (isOverdue(i) ? "overdue" : i.status) === k)
            .length,
    ])
  );
  const shown =
    filter === "all"
      ? invoices
      : invoices.filter(
          (i) => (isOverdue(i) ? "overdue" : i.status) === filter
        );

  return (
    <div className="pg fade">
      <div className="pg-hd">
        <div>
          <div className="pg-ttl">Invoices</div>
          <div className="pg-sub">{invoices.length} total</div>
        </div>
        <button className="btn bp" onClick={onNew}>
          <Icon n="plus" s={14} c="#fff" />
          New Invoice
        </button>
      </div>
      <div className="tabs mb4">
        {filters.map(([k, l]) => (
          <button
            key={k}
            className={`tab ${filter === k ? "on" : ""}`}
            onClick={() => setFilter(k)}
          >
            {l}
            {counts[k] > 0 && (
              <span style={{ marginLeft: 4, fontSize: 10, opacity: 0.7 }}>
                ({counts[k]})
              </span>
            )}
          </button>
        ))}
      </div>
      <div className="tcard">
        {shown.length === 0 ? (
          <div className="empty">
            <Icon n="inbox" s={40} c="var(--tx3)" />
            <p>No {filter !== "all" ? filter : ""} invoices yet.</p>
          </div>
        ) : (
          <div className="tscroll">
            <table>
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Client</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Due</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {shown.map((inv) => (
                  <tr key={inv.id} onClick={() => onView(inv)}>
                    <td className="t-id">{inv.id}</td>
                    <td>
                      <div className="t-client">{inv.client.name}</div>
                      <div className="t-email">{inv.client.email}</div>
                    </td>
                    <td>{typeBadge(inv.type)}</td>
                    <td>
                      <div className="t-amt">
                        {csym(inv.currency)}
                        {fmt(inv.total)}
                      </div>
                    </td>
                    <td>
                      {statusBadge(isOverdue(inv) ? "overdue" : inv.status)}
                    </td>
                    <td
                      style={{
                        fontSize: 12,
                        color: isOverdue(inv) ? "var(--rd)" : "var(--tx3)",
                      }}
                    >
                      {inv.dueDate || "-"}
                    </td>
                    <td>
                      <button
                        className="btn bg btn-sm"
                        style={{ padding: "5px 8px" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onView(inv);
                        }}
                      >
                        <Icon n="eye" s={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// -- CREATE INVOICE ------------------------------------------------------------
function CreateInvoice({ clients, templates, onCreated, onCancel }) {
  const [step, setStep] = useState(1);
  const [busy, setBusy] = useState(false);
  const [showClientPicker, setShowClientPicker] = useState(false);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [form, setForm] = useState({
    type: "standard",
    currency: "USD",
    dueDate: "",
    terms: "Net 14",
    notes: "",
    deposit: 0,
    clientName: "",
    clientEmail: "",
    clientAddress: "",
  });
  const [items, setItems] = useState([{ desc: "", qty: 1, price: "" }]);
  const [tax, setTax] = useState(null);
  const [taxEnabled, setTaxEnabled] = useState(false);
  const [depositEnabled, setDepositEnabled] = useState(false);

  const setItem = (idx, f, v) =>
    setItems((p) => p.map((it, i) => (i === idx ? { ...it, [f]: v } : it)));
  const { sub, taxAmt, gross, dep, total } = calcTotal(
    items,
    taxEnabled ? tax : null,
    depositEnabled ? form.deposit : 0
  );
  const S2 = csym(form.currency);
  const canNext = form.clientName && items.some((i) => i.desc && i.price);

  function applyTemplate(t) {
    setItems(t.items.map((i) => ({ ...i })));
    setShowTemplatePicker(false);
  }
  function applyClient(c) {
    setForm((p) => ({
      ...p,
      clientName: c.name,
      clientEmail: c.email,
      clientAddress: c.address || "",
    }));
    setShowClientPicker(false);
  }

  async function generate() {
    setBusy(true);
    await wait(800);
    const inv = {
      id: uid(),
      linkId: linkId(),
      client: {
        name: form.clientName,
        email: form.clientEmail,
        address: form.clientAddress,
      },
      type: form.type,
      currency: form.currency,
      items: items.filter((i) => i.desc && i.price),
      tax: taxEnabled ? tax : null,
      taxAmt: taxEnabled ? taxAmt : 0,
      deposit: depositEnabled ? form.deposit : 0,
      total,
      status: "draft",
      created: new Date().toISOString().split("T")[0],
      dueDate: form.dueDate,
      paid: null,
      notes: form.notes,
      terms: form.terms,
      ngn: null,
      events: [{ type: "created", ts: ts() }],
    };
    setBusy(false);
    onCreated(inv);
  }

  return (
    <div className="pg fade">
      <div className="pg-hd">
        <div>
          <div className="pg-ttl">
            {step === 1 ? "New Invoice" : "Preview & Send"}
          </div>
          <div className="pg-sub">
            {step === 1
              ? "Fill in the invoice details"
              : "Review your invoice before sending"}
          </div>
        </div>
        <div className="row">
          {step === 2 && (
            <button className="btn bg" onClick={() => setStep(1)}>
              <Icon n="chevL" s={13} />
              Edit
            </button>
          )}
          <button className="btn bs" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>

      {showClientPicker && (
        <div className="modal-bg" onClick={() => setShowClientPicker(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-ttl">Select Client</div>
            <div className="modal-sub">Choose from your address book</div>
            {clients.map((c) => (
              <div
                key={c.id}
                className="client-item"
                onClick={() => applyClient(c)}
              >
                <div
                  className="av"
                  style={{ width: 32, height: 32, fontSize: 11 }}
                >
                  {c.name.charAt(0)}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{c.name}</div>
                  <div style={{ fontSize: 12, color: "var(--tx3)" }}>
                    {c.email}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showTemplatePicker && (
        <div className="modal-bg" onClick={() => setShowTemplatePicker(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-ttl">Invoice Templates</div>
            <div className="modal-sub">
              Start with a pre-filled line item set
            </div>
            {templates.map((t) => (
              <div
                key={t.id}
                className="client-item"
                onClick={() => applyTemplate(t)}
              >
                <div
                  className="af-icon b-gray"
                  style={{ width: 32, height: 32 }}
                >
                  <Icon n="template" s={14} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: "var(--tx3)" }}>
                    {t.items.length} line items
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {step === 1 && (
        <div
          className="two-col"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 300px",
            gap: 18,
            alignItems: "start",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Invoice type */}
            <div className="card">
              <div className="card-ttl">Invoice Type</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {INVOICE_TYPES.map((t) => (
                  <button
                    key={t.id}
                    className={`btn btn-sm ${form.type === t.id ? "bp" : "bs"}`}
                    onClick={() => setForm((p) => ({ ...p, type: t.id }))}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              {form.type === "deposit" && (
                <div
                  className="mt3"
                  style={{ display: "flex", alignItems: "center", gap: 12 }}
                >
                  <span style={{ fontSize: 13, color: "var(--tx2)" }}>
                    Deposit percentage
                  </span>
                  <div className="ipw" style={{ width: 100 }}>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={form.deposit}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          deposit: parseFloat(e.target.value) || 50,
                        }))
                      }
                      style={{ paddingRight: 28 }}
                    />
                    <span
                      style={{
                        position: "absolute",
                        right: 11,
                        top: "50%",
                        transform: "translateY(-50%)",
                        fontSize: 13,
                        color: "var(--tx3)",
                      }}
                    >
                      %
                    </span>
                  </div>
                </div>
              )}
              {form.type === "credit" && (
                <div
                  className="mt2"
                  style={{
                    fontSize: 12,
                    color: "var(--am)",
                    background: "var(--amlt)",
                    padding: "8px 12px",
                    borderRadius: 8,
                  }}
                >
                  Credit notes reduce a previously issued invoice. The total
                  will appear as a negative amount.
                </div>
              )}
            </div>

            {/* Client */}
            <div className="card">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 14,
                }}
              >
                <div className="card-ttl" style={{ margin: 0 }}>
                  Bill To
                </div>
                <button
                  className="btn bg btn-sm"
                  onClick={() => setShowClientPicker(true)}
                >
                  <Icon n="users" s={12} />
                  Address Book
                </button>
              </div>
              <div className="fgrid">
                <div className="fg">
                  <label>Client name</label>
                  <input
                    placeholder="Acme Corp"
                    value={form.clientName}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, clientName: e.target.value }))
                    }
                  />
                </div>
                <div className="fg">
                  <label>Email</label>
                  <input
                    type="email"
                    placeholder="billing@acmecorp.io"
                    value={form.clientEmail}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, clientEmail: e.target.value }))
                    }
                  />
                </div>
                <div className="fg full">
                  <label>Address (optional)</label>
                  <input
                    placeholder="123 Main St, San Francisco, CA"
                    value={form.clientAddress}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, clientAddress: e.target.value }))
                    }
                  />
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="card">
              <div className="fgrid mb4">
                <div className="fg">
                  <label>Currency</label>
                  <select
                    value={form.currency}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, currency: e.target.value }))
                    }
                  >
                    {CURRENCIES.filter((c) => c !== "NGN").map((c) => (
                      <option key={c} value={c}>
                        {c} - {CURRENCY_NAMES[c]}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="fg">
                  <label>Due date</label>
                  <input
                    type="date"
                    value={form.dueDate}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, dueDate: e.target.value }))
                    }
                  />
                </div>
                <div className="fg full">
                  <label>Payment terms</label>
                  <div
                    style={{
                      display: "flex",
                      gap: 6,
                      flexWrap: "wrap",
                      marginBottom: 6,
                    }}
                  >
                    {PAYMENT_TERMS_PRESETS.slice(0, 3).map((t) => (
                      <button
                        key={t}
                        className={`btn btn-sm ${
                          form.terms === t ? "bp" : "bg"
                        }`}
                        onClick={() => setForm((p) => ({ ...p, terms: t }))}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                  <input
                    placeholder="Payment terms"
                    value={form.terms}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, terms: e.target.value }))
                    }
                  />
                </div>
              </div>

              {/* Line items */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 10,
                }}
              >
                <label style={{ margin: 0 }}>Line Items</label>
                <button
                  className="btn bg btn-sm"
                  onClick={() => setShowTemplatePicker(true)}
                >
                  <Icon n="template" s={12} />
                  Templates
                </button>
              </div>
              <div className="li-wrap mb3">
                <div className="li-hd">
                  <span>Description</span>
                  <span>Qty</span>
                  <span>Unit Price</span>
                  <span className="am-col">Amount</span>
                  <span></span>
                </div>
                {items.map((it, idx) => {
                  const amt =
                    (parseFloat(it.price) || 0) * (parseInt(it.qty) || 1);
                  return (
                    <div className="li-row" key={idx}>
                      <input
                        placeholder="Service description"
                        value={it.desc}
                        onChange={(e) => setItem(idx, "desc", e.target.value)}
                      />
                      <input
                        type="number"
                        min="1"
                        value={it.qty}
                        onChange={(e) => setItem(idx, "qty", e.target.value)}
                        style={{ textAlign: "center" }}
                      />
                      <div className="ipw">
                        <span className="ipp">{S2}</span>
                        <input
                          type="number"
                          placeholder="0.00"
                          value={it.price}
                          onChange={(e) =>
                            setItem(idx, "price", e.target.value)
                          }
                        />
                      </div>
                      <span
                        className="am-col mono"
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: "var(--tx)",
                        }}
                      >
                        {S2}
                        {fmt(amt)}
                      </span>
                      <button
                        className="btn bg"
                        style={{ padding: "5px" }}
                        onClick={() =>
                          setItems((p) => p.filter((_, i) => i !== idx))
                        }
                        disabled={items.length === 1}
                      >
                        <Icon n="trash" s={11} />
                      </button>
                    </div>
                  );
                })}
                <div className="li-ft">
                  <button
                    className="btn bg btn-sm"
                    onClick={() =>
                      setItems((p) => [...p, { desc: "", qty: 1, price: "" }])
                    }
                  >
                    <Icon n="plus" s={12} />
                    Add line
                  </button>
                  <div>
                    Subtotal{" "}
                    <span className="li-total">
                      {S2}
                      {fmt(sub)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tax */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: taxEnabled ? 12 : 0,
                }}
              >
                <label
                  style={{
                    margin: 0,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    textTransform: "none",
                    fontSize: 13,
                    fontWeight: 500,
                    color: "var(--tx2)",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={taxEnabled}
                    onChange={(e) => setTaxEnabled(e.target.checked)}
                    style={{ width: 15, height: 15, accentColor: "var(--g)" }}
                  />
                  Add Tax
                </label>
                {taxEnabled && (
                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      flex: 1,
                      flexWrap: "wrap",
                    }}
                  >
                    <select
                      value={tax?.type || "vat"}
                      onChange={(e) => {
                        const tt = TAX_TYPES.find(
                          (t) => t.id === e.target.value
                        );
                        setTax({ type: tt.id, rate: tt.default });
                      }}
                      style={{ flex: 1, minWidth: 140 }}
                    >
                      {TAX_TYPES.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                    <div className="ipw" style={{ width: 90 }}>
                      <input
                        type="number"
                        value={tax?.rate || 7.5}
                        onChange={(e) =>
                          setTax((p) => ({
                            ...p,
                            rate: parseFloat(e.target.value) || 0,
                          }))
                        }
                        style={{ paddingRight: 24 }}
                      />
                      <span
                        style={{
                          position: "absolute",
                          right: 10,
                          top: "50%",
                          transform: "translateY(-50%)",
                          fontSize: 12,
                          color: "var(--tx3)",
                        }}
                      >
                        %
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Totals */}
              <div className="totals-box">
                <div className="tot-row">
                  <span style={{ color: "var(--tx2)" }}>Subtotal</span>
                  <span className="mono">
                    {S2}
                    {fmt(sub)}
                  </span>
                </div>
                {taxEnabled && tax && (
                  <div className="tot-row">
                    <span style={{ color: "var(--tx2)" }}>
                      {TAX_TYPES.find((t) => t.id === tax.type)?.label} (
                      {tax.rate}%)
                    </span>
                    <span className="mono">
                      {S2}
                      {fmt(taxAmt)}
                    </span>
                  </div>
                )}
                {form.type === "deposit" && (
                  <div className="tot-row">
                    <span style={{ color: "var(--tx2)" }}>Gross total</span>
                    <span className="mono">
                      {S2}
                      {fmt(gross)}
                    </span>
                  </div>
                )}
                {form.type === "deposit" && (
                  <div className="tot-row">
                    <span style={{ color: "var(--pu)" }}>
                      Deposit ({form.deposit}%)
                    </span>
                    <span className="mono" style={{ color: "var(--pu)" }}>
                      {S2}
                      {fmt(dep)}
                    </span>
                  </div>
                )}
                <div className="tot-row final">
                  <span>
                    {form.type === "deposit"
                      ? "Amount Due Now"
                      : form.type === "credit"
                      ? "Credit Amount"
                      : "Total"}
                  </span>
                  <span className="mono">
                    {form.type === "credit" && "-"}
                    {S2}
                    {fmt(total)}
                  </span>
                </div>
              </div>

              {/* Notes */}
              <div className="mt3">
                <label>Notes & Additional Information</label>
                <textarea
                  rows={3}
                  placeholder="Payment instructions, project reference, thank-you note..."
                  value={form.notes}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, notes: e.target.value }))
                  }
                  style={{ resize: "none" }}
                />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div
            style={{
              position: "sticky",
              top: 24,
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            <div className="card">
              <div className="card-ttl">Summary</div>
              <div
                style={{
                  fontFamily: "var(--mo)",
                  fontSize: 24,
                  fontWeight: 700,
                  color: "var(--tx)",
                  letterSpacing: "-.03em",
                  marginBottom: 3,
                }}
              >
                {S2}
                {fmt(total)}
              </div>
              <div
                style={{ fontSize: 11, color: "var(--tx3)", marginBottom: 12 }}
              >
                {CURRENCY_NAMES[form.currency]}
              </div>
              {total > 0 && (
                <div
                  style={{
                    padding: "9px 12px",
                    background: "var(--sf2)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 3,
                    }}
                  >
                    <span style={{ color: "var(--tx3)" }}>Est. NGN</span>
                    <span
                      style={{
                        fontFamily: "var(--mo)",
                        fontWeight: 700,
                        color: "var(--gdk)",
                      }}
                    >
                      {"\u20a6"}
                      {fmtNGN(total * MOCK_RATES[form.currency])}
                    </span>
                  </div>
                  <div style={{ fontSize: 10, color: "var(--tx3)" }}>
                    at approx. {"\u20a6"}
                    {fmt(MOCK_RATES[form.currency], 0)}/{form.currency}
                  </div>
                </div>
              )}
            </div>
            <button
              className="btn bp btn-full btn-lg"
              disabled={!canNext}
              onClick={() => setStep(2)}
            >
              Preview <Icon n="chevR" s={14} c="#fff" />
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div
          className="two-col"
          style={{
            display: "grid",
            gridTemplateColumns: "auto 1fr",
            gap: 24,
            alignItems: "start",
          }}
        >
          <InvoicePreviewCard
            inv={{
              id: "INV-PREVIEW",
              client: {
                name: form.clientName,
                email: form.clientEmail,
                address: form.clientAddress,
              },
              type: form.type,
              currency: form.currency,
              items: items.filter((i) => i.desc),
              tax: taxEnabled ? tax : null,
              taxAmt,
              deposit: form.deposit,
              total,
              terms: form.terms,
              notes: form.notes,
              dueDate: form.dueDate,
              created: new Date().toISOString().split("T")[0],
            }}
            freelancer={{ name: "Lucky Eze", business: "DevCraft Studio" }}
          />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              maxWidth: 280,
            }}
          >
            <div className="card">
              <div className="card-ttl">Looks good?</div>
              <p
                style={{
                  fontSize: 13,
                  color: "var(--tx2)",
                  lineHeight: 1.6,
                  marginBottom: 16,
                }}
              >
                Once created, you can send this invoice by email or share the
                link directly.
              </p>
              <button
                className="btn bp btn-full btn-lg"
                onClick={generate}
                disabled={busy}
              >
                {busy ? (
                  <>
                    <Icon n="spin" s={14} c="#fff" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Icon n="zap" s={14} c="#fff" />
                    Create Invoice
                  </>
                )}
              </button>
            </div>
            <div
              style={{
                padding: "12px 14px",
                background: "var(--sf2)",
                borderRadius: "var(--r)",
                fontSize: 12,
                color: "var(--tx2)",
                lineHeight: 1.6,
              }}
            >
              <strong>After creating,</strong> the invoice starts as a Draft.
              You can then send it by email or copy the shareable link.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// -- INVOICE PREVIEW CARD (reusable) -------------------------------------------
function InvoicePreviewCard({ inv, freelancer }) {
  const S2 = csym(inv.currency);
  const { sub, taxAmt, total } = calcTotal(inv.items, inv.tax, inv.deposit);
  const typeLabels = {
    standard: "INVOICE",
    proforma: "PROFORMA INVOICE",
    deposit: "DEPOSIT INVOICE",
    credit: "CREDIT NOTE",
  };
  return (
    <div className="inv-card">
      <div className="inv-hd">
        <div className="inv-hd-badge">
          <Icon n="zap" s={10} c="#fff" />
          {typeLabels[inv.type] || "INVOICE"}
        </div>
        <div className="inv-hd-from">
          {freelancer?.business || freelancer?.name || "Your Business"}
        </div>
        <div className="inv-hd-biz">Invoice for {inv.client.name}</div>
        <div className="inv-hd-div" />
        <div className="inv-hd-lbl">
          Amount{" "}
          {inv.deposit ? "Due Now" : inv.type === "credit" ? "Credited" : ""}
        </div>
        <div className="inv-hd-amt">
          {inv.type === "credit" && "-"}
          {S2}
          {fmt(inv.total || total)}
        </div>
        {inv.currency !== "NGN" && (
          <div className="inv-hd-ngn">
            {"\u20a6"}
            {fmtNGN((inv.total || total) * MOCK_RATES[inv.currency])} NGN est.
          </div>
        )}
      </div>
      <div className="inv-body">
        <div className="inv-row">
          <span className="inv-l">Invoice #</span>
          <span className="inv-v mono">{inv.id}</span>
        </div>
        <div className="inv-row">
          <span className="inv-l">Date</span>
          <span className="inv-v">{dateStr(inv.created || new Date())}</span>
        </div>
        {inv.dueDate && (
          <div className="inv-row">
            <span className="inv-l">Due date</span>
            <span className="inv-v">{dateStr(inv.dueDate)}</span>
          </div>
        )}
        {inv.terms && (
          <div className="inv-row">
            <span className="inv-l">Terms</span>
            <span className="inv-v">{inv.terms}</span>
          </div>
        )}
        <div className="inv-row">
          <span className="inv-l">Bill to</span>
          <span className="inv-v">
            {inv.client.name}
            {inv.client.email && (
              <div style={{ fontSize: 11, color: "var(--tx3)", marginTop: 1 }}>
                {inv.client.email}
              </div>
            )}
            {inv.client.address && (
              <div style={{ fontSize: 11, color: "var(--tx3)", marginTop: 1 }}>
                {inv.client.address}
              </div>
            )}
          </span>
        </div>
        <div className="inv-items">
          {inv.items.map((it, i) => (
            <div key={i} className="ii-row">
              <span>
                {it.desc}
                {it.qty > 1 && (
                  <span style={{ color: "var(--tx3)" }}> x{it.qty}</span>
                )}
              </span>
              <span style={{ fontFamily: "var(--mo)", fontWeight: 600 }}>
                {S2}
                {fmt((parseFloat(it.price) || 0) * (parseInt(it.qty) || 1))}
              </span>
            </div>
          ))}
          {inv.tax && (
            <div className="ii-row">
              <span style={{ color: "var(--tx3)" }}>
                {TAX_TYPES.find((t) => t.id === inv.tax.type)?.label} (
                {inv.tax.rate}%)
              </span>
              <span style={{ fontFamily: "var(--mo)" }}>
                {S2}
                {fmt(inv.taxAmt || taxAmt)}
              </span>
            </div>
          )}
          {inv.deposit > 0 && (
            <div className="ii-row">
              <span style={{ color: "var(--pu)" }}>
                Deposit ({inv.deposit}%)
              </span>
              <span style={{ fontFamily: "var(--mo)", color: "var(--pu)" }}>
                {S2}
                {fmt(inv.total || total)}
              </span>
            </div>
          )}
          <div className="ii-tot">
            <span>Total</span>
            <span style={{ fontFamily: "var(--mo)" }}>
              {inv.type === "credit" && "-"}
              {S2}
              {fmt(inv.total || total)}
            </span>
          </div>
        </div>
        {inv.notes && (
          <div
            style={{
              padding: "10px 12px",
              background: "var(--sf2)",
              borderRadius: 8,
              fontSize: 12,
              color: "var(--tx2)",
              marginBottom: 12,
              lineHeight: 1.6,
            }}
          >
            {inv.notes}
          </div>
        )}
      </div>
      <div className="inv-stamp">
        <div className="inv-stamp-dot" />
        <div style={{ fontSize: 11, fontWeight: 600, color: "var(--gdk)" }}>
          Created with InvoiceApp
        </div>
        <div
          style={{
            fontFamily: "var(--mo)",
            fontSize: 10,
            color: "var(--tx3)",
            marginLeft: "auto",
          }}
        >
          {inv.id}
        </div>
      </div>
    </div>
  );
}

// -- INVOICE DETAIL ------------------------------------------------------------
function InvoiceDetail({ invoice, onBack, onUpdate, toast }) {
  const [inv, setInv] = useState(invoice);
  const [sendModal, setSendModal] = useState(false);
  const [shareModal, setShareModal] = useState(false);
  const [markPaidModal, setMarkPaidModal] = useState(false);
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [reminderBusy, setReminderBusy] = useState(false);

  const effectiveStatus = isOverdue(inv) ? "overdue" : inv.status;
  const shareUrl = `app.invoiceapp.co/i/${inv.linkId}`;
  const canSend = ["draft", "sent", "viewed", "overdue"].includes(
    effectiveStatus
  );
  const canMarkPaid = !["paid", "cancelled", "draft"].includes(effectiveStatus);

  async function sendEmail() {
    setSending(true);
    await wait(1200);
    const updated = {
      ...inv,
      status: "sent",
      events: [...inv.events, { type: "sent", ts: ts() }],
    };
    setInv(updated);
    onUpdate(updated);
    setSendModal(false);
    setSending(false);
    toast("Invoice sent to " + inv.client.email);
  }
  async function sendReminder() {
    setReminderBusy(true);
    await wait(900);
    const updated = {
      ...inv,
      events: [...inv.events, { type: "sent", ts: ts() + " (reminder)" }],
    };
    setInv(updated);
    onUpdate(updated);
    setReminderBusy(false);
    toast("Reminder sent");
  }
  function markPaid() {
    const updated = {
      ...inv,
      status: "paid",
      paid: new Date().toISOString().split("T")[0],
      ngn: Math.round(inv.total * MOCK_RATES[inv.currency]),
      events: [...inv.events, { type: "paid", ts: ts() }],
    };
    setInv(updated);
    onUpdate(updated);
    setMarkPaidModal(false);
    toast("Invoice marked as paid");
  }
  function cancel() {
    const updated = {
      ...inv,
      status: "cancelled",
      events: [...inv.events, { type: "cancelled", ts: ts() }],
    };
    setInv(updated);
    onUpdate(updated);
    toast("Invoice cancelled");
  }
  function copyLink() {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast("Link copied to clipboard");
  }

  const viewCount = inv.events.filter((e) => e.type === "viewed").length;

  return (
    <div className="pg fade">
      {sendModal && (
        <div className="modal-bg" onClick={() => setSendModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-ttl">Send Invoice by Email</div>
            <div className="modal-sub">
              This will send the invoice to {inv.client.email} with a link to
              view it online.
            </div>
            <div
              style={{
                background: "var(--sf2)",
                borderRadius: 8,
                padding: "12px 14px",
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 12,
                  marginBottom: 4,
                }}
              >
                <span style={{ color: "var(--tx3)" }}>To</span>
                <span style={{ fontWeight: 600 }}>{inv.client.email}</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 12,
                  marginBottom: 4,
                }}
              >
                <span style={{ color: "var(--tx3)" }}>Subject</span>
                <span style={{ fontWeight: 600 }}>
                  Invoice {inv.id} from DevCraft Studio
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 12,
                }}
              >
                <span style={{ color: "var(--tx3)" }}>Amount</span>
                <span style={{ fontWeight: 600, fontFamily: "var(--mo)" }}>
                  {csym(inv.currency)}
                  {fmt(inv.total)}
                </span>
              </div>
            </div>
            <div
              style={{
                fontSize: 12,
                color: "var(--tx3)",
                marginBottom: 16,
                lineHeight: 1.6,
              }}
            >
              The email will include a "View Invoice" button that opens the
              invoice page. When the client opens it, you will be notified.
            </div>
            <div className="row">
              <button
                className="btn bp btn-full"
                onClick={sendEmail}
                disabled={sending}
              >
                {sending ? (
                  <>
                    <Icon n="spin" s={13} c="#fff" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Icon n="mail" s={13} c="#fff" />
                    Send Invoice
                  </>
                )}
              </button>
              <button className="btn bs" onClick={() => setSendModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {shareModal && (
        <div className="modal-bg" onClick={() => setShareModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-ttl">Share Invoice Link</div>
            <div className="modal-sub">
              Anyone with this link can view the invoice. When they open it, you
              will be notified.
            </div>
            <div className="lbox mb4">
              <span className="lurl">https://{shareUrl}</span>
              <button className="btn bg btn-sm" onClick={copyLink}>
                {copied ? (
                  <>
                    <Icon n="check" s={12} c="var(--g)" />
                    Copied
                  </>
                ) : (
                  <>
                    <Icon n="copy" s={12} />
                    Copy
                  </>
                )}
              </button>
            </div>
            <div className="row">
              <button
                className="btn bs btn-full"
                onClick={() => {
                  toast("Opening WhatsApp...");
                  setShareModal(false);
                }}
              >
                <Icon n="whatsapp" s={13} />
                Share via WhatsApp
              </button>
              <button
                className="btn bs btn-full"
                onClick={() => {
                  toast("Opening email client...");
                  setShareModal(false);
                }}
              >
                <Icon n="mail" s={13} />
                Open in Email
              </button>
            </div>
          </div>
        </div>
      )}

      {markPaidModal && (
        <div className="modal-bg" onClick={() => setMarkPaidModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-ttl">Mark as Paid</div>
            <div className="modal-sub">
              Confirm that you have received payment of {csym(inv.currency)}
              {fmt(inv.total)} for this invoice.
            </div>
            <div className="row">
              <button className="btn bp btn-full" onClick={markPaid}>
                <Icon n="check" s={13} c="#fff" />
                Confirm Payment Received
              </button>
              <button
                className="btn bs"
                onClick={() => setMarkPaidModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <button className="btn bg btn-sm mb4" onClick={onBack}>
        <Icon n="chevL" s={13} />
        Back
      </button>

      <div className="pg-hd">
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <div className="pg-ttl">{inv.id}</div>
            {statusBadge(effectiveStatus)}
            {typeBadge(inv.type)}
          </div>
          <div className="pg-sub">
            {inv.client.name} {"\u00b7"} Created {dateStr(inv.created)}
          </div>
        </div>
        <div className="row">
          {canMarkPaid && (
            <button
              className="btn bp btn-sm"
              onClick={() => setMarkPaidModal(true)}
            >
              <Icon n="check" s={13} c="#fff" />
              Mark Paid
            </button>
          )}
          {canSend && (
            <button
              className="btn bs btn-sm"
              onClick={() => setSendModal(true)}
            >
              <Icon n="mail" s={13} />
              Send Email
            </button>
          )}
          <button className="btn bs btn-sm" onClick={() => setShareModal(true)}>
            <Icon n="link" s={13} />
            Share Link
          </button>
          <button
            className="btn bg btn-sm"
            onClick={() => toast("Downloading PDF...")}
          >
            <Icon n="download" s={13} />
            PDF
          </button>
        </div>
      </div>

      <div className="tabs">
        {[
          ["overview", "Overview"],
          ["activity", "Tracking & Activity"],
          ["preview", "Invoice Preview"],
        ].map(([k, l]) => (
          <button
            key={k}
            className={`tab ${activeTab === k ? "on" : ""}`}
            onClick={() => setActiveTab(k)}
          >
            {l}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div
          className="two-col"
          style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 18 }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="card">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 10,
                  marginBottom: 18,
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "var(--tx3)",
                      textTransform: "uppercase",
                      letterSpacing: ".06em",
                      marginBottom: 4,
                    }}
                  >
                    Amount
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--mo)",
                      fontSize: 28,
                      fontWeight: 700,
                      color: "var(--tx)",
                      letterSpacing: "-.03em",
                    }}
                  >
                    {csym(inv.currency)}
                    {fmt(inv.total)}
                  </div>
                </div>
                {inv.ngn && (
                  <div style={{ textAlign: "right" }}>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: "var(--tx3)",
                        textTransform: "uppercase",
                        letterSpacing: ".06em",
                        marginBottom: 4,
                      }}
                    >
                      Received (NGN)
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--mo)",
                        fontSize: 22,
                        fontWeight: 700,
                        color: "var(--gdk)",
                      }}
                    >
                      {"\u20a6"}
                      {fmt(inv.ngn, 0)}
                    </div>
                  </div>
                )}
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <div
                  style={{
                    flex: 1,
                    minWidth: 140,
                    background: "var(--sf2)",
                    borderRadius: 8,
                    padding: "10px 13px",
                  }}
                >
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: "var(--tx3)",
                      textTransform: "uppercase",
                      letterSpacing: ".06em",
                      marginBottom: 3,
                    }}
                  >
                    Client
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "var(--tx)",
                    }}
                  >
                    {inv.client.name}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--tx3)" }}>
                    {inv.client.email}
                  </div>
                </div>
                {inv.dueDate && (
                  <div
                    style={{
                      flex: 1,
                      minWidth: 140,
                      background: isOverdue(inv) ? "var(--rdlt)" : "var(--sf2)",
                      borderRadius: 8,
                      padding: "10px 13px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: isOverdue(inv) ? "var(--rd)" : "var(--tx3)",
                        textTransform: "uppercase",
                        letterSpacing: ".06em",
                        marginBottom: 3,
                      }}
                    >
                      Due Date
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: isOverdue(inv) ? "var(--rd)" : "var(--tx)",
                      }}
                    >
                      {dateStr(inv.dueDate)}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: isOverdue(inv) ? "var(--rd)" : "var(--tx3)",
                      }}
                    >
                      {inv.terms}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="card">
              <div className="card-ttl">Line Items</div>
              <div className="inv-items" style={{ margin: 0 }}>
                {inv.items.map((it, i) => (
                  <div key={i} className="ii-row">
                    <div>
                      <div>{it.desc}</div>
                      {it.qty > 1 && <div className="ii-sub">x{it.qty}</div>}
                    </div>
                    <span style={{ fontFamily: "var(--mo)", fontWeight: 600 }}>
                      {csym(inv.currency)}
                      {fmt(
                        (parseFloat(it.price) || 0) * (parseInt(it.qty) || 1)
                      )}
                    </span>
                  </div>
                ))}
                {inv.tax && (
                  <div className="ii-row">
                    <span style={{ color: "var(--tx3)" }}>
                      {TAX_TYPES.find((t) => t.id === inv.tax.type)?.label} (
                      {inv.tax.rate}%)
                    </span>
                    <span style={{ fontFamily: "var(--mo)" }}>
                      {csym(inv.currency)}
                      {fmt(inv.taxAmt)}
                    </span>
                  </div>
                )}
                {inv.deposit > 0 && (
                  <div className="ii-row">
                    <span style={{ color: "var(--pu)" }}>
                      Deposit ({inv.deposit}%)
                    </span>
                    <span
                      style={{ fontFamily: "var(--mo)", color: "var(--pu)" }}
                    >
                      {csym(inv.currency)}
                      {fmt(inv.total)}
                    </span>
                  </div>
                )}
                <div className="ii-tot">
                  <span>Total</span>
                  <span style={{ fontFamily: "var(--mo)" }}>
                    {csym(inv.currency)}
                    {fmt(inv.total)}
                  </span>
                </div>
              </div>
              {inv.notes && (
                <div
                  style={{
                    marginTop: 12,
                    padding: "10px 12px",
                    background: "var(--sf2)",
                    borderRadius: 8,
                    fontSize: 12,
                    color: "var(--tx2)",
                    lineHeight: 1.6,
                  }}
                >
                  {inv.notes}
                </div>
              )}
            </div>

            {/* Overdue reminders */}
            {(effectiveStatus === "overdue" || effectiveStatus === "sent") && (
              <div
                style={{
                  background: "var(--amlt)",
                  border: "1.5px solid #fcd34d",
                  borderRadius: "var(--r)",
                  padding: "14px 18px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 10,
                }}
              >
                <div>
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: 13,
                      color: "var(--amdk)",
                    }}
                  >
                    {effectiveStatus === "overdue"
                      ? "This invoice is overdue"
                      : "Awaiting payment"}
                  </div>
                  <div
                    style={{ fontSize: 12, color: "var(--am)", marginTop: 2 }}
                  >
                    {effectiveStatus === "overdue"
                      ? "Send a reminder to your client"
                      : "You can send a reminder if needed"}
                  </div>
                </div>
                <button
                  className="btn btn-sm"
                  style={{ background: "var(--am)", color: "#fff" }}
                  onClick={sendReminder}
                  disabled={reminderBusy}
                >
                  {reminderBusy ? (
                    <>
                      <Icon n="spin" s={12} c="#fff" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Icon n="bell" s={12} c="#fff" />
                      Send Reminder
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          <div>
            <div className="card mb3">
              <div className="card-ttl">Share</div>
              <div className="lbox mb3">
                <span className="lurl">https://{shareUrl}</span>
                <button className="btn bg btn-sm" onClick={copyLink}>
                  {copied ? (
                    <Icon n="check" s={12} c="var(--g)" />
                  ) : (
                    <Icon n="copy" s={12} />
                  )}
                </button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                <button
                  className="btn bs btn-full btn-sm"
                  onClick={() => setSendModal(true)}
                >
                  <Icon n="mail" s={13} />
                  Send by Email
                </button>
                <button
                  className="btn bs btn-full btn-sm"
                  onClick={() => setShareModal(true)}
                >
                  <Icon n="whatsapp" s={13} />
                  Share via WhatsApp
                </button>
              </div>
            </div>
            {inv.status !== "paid" && inv.status !== "cancelled" && (
              <div className="card">
                <div className="card-ttl">Actions</div>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 8 }}
                >
                  {canMarkPaid && (
                    <button
                      className="btn bp btn-full btn-sm"
                      onClick={() => setMarkPaidModal(true)}
                    >
                      <Icon n="check" s={13} c="#fff" />
                      Mark as Paid
                    </button>
                  )}
                  <button
                    className="btn bs btn-full btn-sm"
                    onClick={() => toast("Editing...")}
                  >
                    <Icon n="edit" s={13} />
                    Edit Invoice
                  </button>
                  <button className="btn bd btn-full btn-sm" onClick={cancel}>
                    <Icon n="close" s={13} />
                    Cancel Invoice
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "activity" && (
        <div
          className="two-col"
          style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 18 }}
        >
          <div>
            <div className="card mb4">
              <div className="card-ttl">Tracking</div>
              <div
                style={{
                  display: "flex",
                  gap: 12,
                  marginBottom: 16,
                  flexWrap: "wrap",
                }}
              >
                {[
                  ["Views", viewCount, viewCount > 0 ? "b-purple" : "b-gray"],
                  [
                    "Status",
                    STATUS_META[effectiveStatus]?.label || "Draft",
                    {
                      green: "b-green",
                      blue: "b-blue",
                      red: "b-red",
                      amber: "b-amber",
                      purple: "b-purple",
                      gray: "b-gray",
                    }[STATUS_META[effectiveStatus]?.color || "gray"],
                  ],
                  [
                    "Sent",
                    inv.events.filter((e) => e.type === "sent").length + "x",
                    "b-blue",
                  ],
                ].map(([l, v, c]) => (
                  <div
                    key={l}
                    style={{
                      background: "var(--sf2)",
                      borderRadius: 8,
                      padding: "10px 14px",
                      flex: 1,
                      minWidth: 80,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: "var(--tx3)",
                        textTransform: "uppercase",
                        letterSpacing: ".06em",
                        marginBottom: 4,
                      }}
                    >
                      {l}
                    </div>
                    <span className={`badge ${c}`}>{v}</span>
                  </div>
                ))}
              </div>
              {viewCount > 0 && (
                <div
                  style={{
                    background: "var(--pult)",
                    border: "1px solid #c4b5fd",
                    borderRadius: 8,
                    padding: "10px 14px",
                    marginBottom: 16,
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "var(--pu)",
                      marginBottom: 2,
                    }}
                  >
                    Client opened this invoice
                  </div>
                  <div
                    style={{ fontSize: 11, color: "var(--pu)", opacity: 0.8 }}
                  >
                    Last viewed:{" "}
                    {inv.events.filter((e) => e.type === "viewed").pop()?.ts}
                  </div>
                </div>
              )}
            </div>
            <div className="card">
              <div className="card-ttl">Activity Log</div>
              <div className="timeline">
                {[...inv.events].reverse().map((ev, i) => {
                  const iconMap = {
                    created: "tag",
                    sent: "send",
                    viewed: "eye",
                    downloaded: "download",
                    paid: "check",
                    cancelled: "close",
                    disputed: "alert",
                    reminder: "bell",
                  };
                  const colorMap = {
                    created: "b-gray",
                    sent: "b-blue",
                    viewed: "b-purple",
                    downloaded: "b-gray",
                    paid: "b-green",
                    cancelled: "b-gray",
                    disputed: "b-amber",
                    reminder: "b-amber",
                  };
                  return (
                    <div key={i} className="tl-item">
                      <div
                        className={`tl-dot ${
                          ev.type === "paid" ? "done" : i === 0 ? "active" : ""
                        }`}
                      >
                        <Icon
                          n={iconMap[ev.type] || "activity"}
                          s={11}
                          c={
                            ev.type === "paid"
                              ? "var(--g)"
                              : i === 0
                              ? "var(--bl)"
                              : "var(--tx3)"
                          }
                        />
                      </div>
                      <div>
                        <div
                          className="tl-lbl"
                          style={{ textTransform: "capitalize" }}
                        >
                          {ev.type.replace("_", " ")}
                        </div>
                        <div className="tl-ts">{ev.ts}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="card" style={{ height: "fit-content" }}>
            <div className="card-ttl">Invoice Status</div>
            <div className="timeline">
              {[
                { label: "Draft", done: true, active: inv.status === "draft" },
                {
                  label: "Sent",
                  done: ["sent", "viewed", "overdue", "paid"].includes(
                    inv.status
                  ),
                  active: inv.status === "sent",
                },
                {
                  label: "Viewed",
                  done:
                    ["viewed", "paid"].includes(inv.status) || viewCount > 0,
                  active: inv.status === "viewed",
                },
                { label: "Paid", done: inv.status === "paid", active: false },
              ].map((st, i) => (
                <div key={i} className="tl-item">
                  <div
                    className={`tl-dot ${st.done ? "done" : ""} ${
                      st.active ? "active" : ""
                    }`}
                  >
                    {st.done ? (
                      <Icon n="check" s={10} c="var(--g)" />
                    ) : (
                      <div
                        style={{
                          width: 5,
                          height: 5,
                          borderRadius: "50%",
                          background: "var(--bd2)",
                        }}
                      />
                    )}
                  </div>
                  <div>
                    <div
                      className="tl-lbl"
                      style={{
                        color: st.done
                          ? "var(--tx)"
                          : st.active
                          ? "var(--tx)"
                          : "var(--tx3)",
                        fontWeight: st.done || st.active ? 600 : 400,
                      }}
                    >
                      {st.label}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "preview" && (
        <div
          style={{
            display: "flex",
            gap: 24,
            flexWrap: "wrap",
            alignItems: "start",
          }}
        >
          <InvoicePreviewCard
            inv={inv}
            freelancer={{ name: "Lucky Eze", business: "DevCraft Studio" }}
          />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              maxWidth: 260,
            }}
          >
            <button
              className="btn bp btn-full"
              onClick={() => toast("Downloading PDF...")}
            >
              <Icon n="download" s={14} c="#fff" />
              Download PDF
            </button>
            <button
              className="btn bs btn-full"
              onClick={() => setSendModal(true)}
            >
              <Icon n="mail" s={14} />
              Send by Email
            </button>
            <button
              className="btn bs btn-full"
              onClick={() => setShareModal(true)}
            >
              <Icon n="link" s={14} />
              Copy Shareable Link
            </button>
          </div>
        </div>
      )}
    </div>
  );

  // function 'var(--r)' { return "var(--r)"; }
}

// -- CLIENT PAGE (public invoice view) -----------------------------------------
function ClientInvoiceView({ invoice, onBack }) {
  const [paid, setPaid] = useState(false);
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        padding: "24px 16px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
      className="fade"
    >
      <div
        style={{
          width: "100%",
          maxWidth: 560,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <div
          style={{
            fontSize: 11,
            color: "var(--tx3)",
            display: "flex",
            alignItems: "center",
            gap: 5,
          }}
        >
          <Icon n="zap" s={12} c="var(--g)" />
          <span style={{ color: "var(--gdk)", fontWeight: 600 }}>
            invoiceapp.co
          </span>
          <span>{"\u00b7"} Secure invoice</span>
        </div>
        <button className="btn bg btn-sm" onClick={onBack}>
          <Icon n="chevL" s={12} />
          Back to Dashboard
        </button>
      </div>

      {paid ? (
        <div
          style={{
            maxWidth: 460,
            width: "100%",
            background: "var(--sf)",
            borderRadius: 16,
            padding: 32,
            textAlign: "center",
            boxShadow: "var(--shl)",
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: "var(--glt)",
              border: "2px solid var(--gmid)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              animation: "fi .3s ease",
            }}
          >
            <Icon n="check" s={28} c="var(--g)" />
          </div>
          <div
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: "var(--tx)",
              marginBottom: 6,
            }}
          >
            Thank you!
          </div>
          <div
            style={{
              fontSize: 13,
              color: "var(--tx3)",
              lineHeight: 1.6,
              marginBottom: 20,
            }}
          >
            You have confirmed payment for invoice {invoice.id}. The freelancer
            has been notified.
          </div>
          <button className="btn bp btn-full" onClick={() => setPaid(false)}>
            <Icon n="chevL" s={13} c="#fff" />
            Back to Invoice
          </button>
        </div>
      ) : (
        <div style={{ maxWidth: 460, width: "100%" }}>
          <InvoicePreviewCard
            inv={invoice}
            freelancer={{ name: "Lucky Eze", business: "DevCraft Studio" }}
          />
          <div
            style={{
              marginTop: 16,
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            <button
              className="btn bp btn-full btn-lg"
              onClick={() => setPaid(true)}
            >
              <Icon n="check" s={14} c="#fff" />I have made this payment
            </button>
            <button className="btn bs btn-full" onClick={() => {}}>
              <Icon n="download" s={13} />
              Download PDF
            </button>
            <div
              style={{ textAlign: "center", fontSize: 11, color: "var(--tx3)" }}
            >
              Have questions? Contact{" "}
              {invoice.client?.email || "the freelancer"} directly.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// -- CLIENTS PAGE --------------------------------------------------------------
function ClientsPage({ clients, setClients, invoices, toast }) {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    address: "",
    phone: "",
  });

  function add() {
    if (!form.name || !form.email) return;
    setClients((p) => [...p, { id: "c" + Date.now(), ...form }]);
    setForm({ name: "", email: "", address: "", phone: "" });
    setShowAdd(false);
    toast("Client added");
  }

  return (
    <div className="pg fade">
      {showAdd && (
        <div className="modal-bg" onClick={() => setShowAdd(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-ttl">Add Client</div>
            <div className="modal-sub">Save a client to your address book</div>
            <div className="fgrid mb4">
              <div className="fg full">
                <label>Name</label>
                <input
                  placeholder="Acme Corp"
                  value={form.name}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, name: e.target.value }))
                  }
                />
              </div>
              <div className="fg full">
                <label>Email</label>
                <input
                  type="email"
                  placeholder="billing@acmecorp.io"
                  value={form.email}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, email: e.target.value }))
                  }
                />
              </div>
              <div className="fg full">
                <label>Address (optional)</label>
                <input
                  placeholder="123 Main St, San Francisco"
                  value={form.address}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, address: e.target.value }))
                  }
                />
              </div>
              <div className="fg full">
                <label>Phone (optional)</label>
                <input
                  placeholder="+1 415 555 0123"
                  value={form.phone}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, phone: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="row">
              <button
                className="btn bp btn-full"
                onClick={add}
                disabled={!form.name || !form.email}
              >
                <Icon n="plus" s={13} c="#fff" />
                Add Client
              </button>
              <button className="btn bs" onClick={() => setShowAdd(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="pg-hd">
        <div>
          <div className="pg-ttl">Clients</div>
          <div className="pg-sub">{clients.length} in address book</div>
        </div>
        <button className="btn bp" onClick={() => setShowAdd(true)}>
          <Icon n="plus" s={14} c="#fff" />
          Add Client
        </button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {clients.map((c) => {
          const cInvs = invoices.filter((i) => i.client.email === c.email);
          const cTotal = cInvs
            .filter((i) => i.status === "paid")
            .reduce((s, i) => s + i.total, 0);
          return (
            <div
              key={c.id}
              className="card"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                flexWrap: "wrap",
              }}
            >
              <div
                className="av"
                style={{ width: 40, height: 40, fontSize: 14, flexShrink: 0 }}
              >
                {c.name.charAt(0)}
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{ fontWeight: 600, fontSize: 14, color: "var(--tx)" }}
                >
                  {c.name}
                </div>
                <div style={{ fontSize: 12, color: "var(--tx3)" }}>
                  {c.email}
                  {c.phone && " \u00b7 " + c.phone}
                </div>
                {c.address && (
                  <div
                    style={{ fontSize: 11, color: "var(--tx3)", marginTop: 1 }}
                  >
                    {c.address}
                  </div>
                )}
              </div>
              <div style={{ textAlign: "right" }}>
                <div
                  style={{
                    fontFamily: "var(--mo)",
                    fontSize: 14,
                    fontWeight: 700,
                    color: "var(--tx)",
                  }}
                >
                  {"$"}
                  {fmt(cTotal, 0)}
                </div>
                <div style={{ fontSize: 11, color: "var(--tx3)" }}>
                  {cInvs.length} invoice{cInvs.length !== 1 ? "s" : ""}
                </div>
              </div>
            </div>
          );
        })}
        {clients.length === 0 && (
          <div className="empty">
            <Icon n="users" s={40} c="var(--tx3)" />
            <p>No clients yet. Add one to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// -- SETTINGS PAGE -------------------------------------------------------------
function SettingsPage({ templates, setTemplates, toast }) {
  const [profile, setProfile] = useState({
    name: "Lucky Eze",
    business: "DevCraft Studio",
    email: "lucky@devcraft.ng",
    phone: "",
    address: "",
    logo: "",
  });
  const [showAddTemplate, setShowAddTemplate] = useState(false);
  const [tplForm, setTplForm] = useState({
    name: "",
    items: [{ desc: "", qty: 1, price: "" }],
  });
  const [activeTab, setActiveTab] = useState("profile");

  function saveProfile() {
    toast("Profile saved");
  }
  function addTemplate() {
    if (!tplForm.name) return;
    setTemplates((p) => [...p, { id: "t" + Date.now(), ...tplForm }]);
    setTplForm({ name: "", items: [{ desc: "", qty: 1, price: "" }] });
    setShowAddTemplate(false);
    toast("Template saved");
  }

  return (
    <div className="pg fade">
      <div className="pg-hd">
        <div>
          <div className="pg-ttl">Settings</div>
          <div className="pg-sub">Manage your account and preferences</div>
        </div>
      </div>
      <div className="tabs">
        {[
          ["profile", "Profile"],
          ["templates", "Templates"],
          ["notifications", "Notifications"],
          ["billing", "Billing"],
        ].map(([k, l]) => (
          <button
            key={k}
            className={`tab ${activeTab === k ? "on" : ""}`}
            onClick={() => setActiveTab(k)}
          >
            {l}
          </button>
        ))}
      </div>

      {activeTab === "profile" && (
        <div
          className="two-col"
          style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 18 }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="card">
              <div className="card-ttl">Personal Details</div>
              <div className="fgrid">
                <div className="fg">
                  <label>Full name</label>
                  <input
                    value={profile.name}
                    onChange={(e) =>
                      setProfile((p) => ({ ...p, name: e.target.value }))
                    }
                  />
                </div>
                <div className="fg">
                  <label>Business / Studio</label>
                  <input
                    value={profile.business}
                    onChange={(e) =>
                      setProfile((p) => ({ ...p, business: e.target.value }))
                    }
                  />
                </div>
                <div className="fg full">
                  <label>Email</label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) =>
                      setProfile((p) => ({ ...p, email: e.target.value }))
                    }
                  />
                </div>
                <div className="fg full">
                  <label>Address (shown on invoices)</label>
                  <textarea
                    rows={2}
                    value={profile.address}
                    onChange={(e) =>
                      setProfile((p) => ({ ...p, address: e.target.value }))
                    }
                    style={{ resize: "none" }}
                    placeholder="Your full address"
                  />
                </div>
              </div>
              <button className="btn bp mt3" onClick={saveProfile}>
                <Icon n="check" s={13} c="#fff" />
                Save Profile
              </button>
            </div>
            <div className="card">
              <div className="card-ttl">Invoice Defaults</div>
              <div className="fgrid">
                <div className="fg">
                  <label>Default currency</label>
                  <select>
                    <option>USD</option>
                    <option>GBP</option>
                    <option>EUR</option>
                  </select>
                </div>
                <div className="fg">
                  <label>Default payment terms</label>
                  <select>
                    <option>Net 14</option>
                    <option>Net 30</option>
                    <option>Due on receipt</option>
                  </select>
                </div>
                <div className="fg full">
                  <label>Default invoice notes</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Thank you for your business!"
                    style={{ resize: "none" }}
                  />
                </div>
              </div>
              <button className="btn bp mt3" onClick={saveProfile}>
                <Icon n="check" s={13} c="#fff" />
                Save Defaults
              </button>
            </div>
          </div>
          <div className="card" style={{ height: "fit-content" }}>
            <div className="card-ttl">Profile Preview</div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 12,
              }}
            >
              <div
                className="av"
                style={{ width: 44, height: 44, fontSize: 14 }}
              >
                LE
              </div>
              <div>
                <div
                  style={{ fontWeight: 700, fontSize: 14, color: "var(--tx)" }}
                >
                  {profile.name}
                </div>
                <div style={{ fontSize: 12, color: "var(--tx3)" }}>
                  {profile.business}
                </div>
              </div>
            </div>
            <div style={{ fontSize: 12, color: "var(--tx3)" }}>
              {profile.email}
            </div>
            {profile.address && (
              <div
                style={{
                  fontSize: 12,
                  color: "var(--tx3)",
                  marginTop: 4,
                  lineHeight: 1.5,
                }}
              >
                {profile.address}
              </div>
            )}
            <div
              style={{
                marginTop: 12,
                padding: "8px 12px",
                background: "var(--glt)",
                borderRadius: 8,
                fontSize: 11,
                color: "var(--gdk)",
              }}
            >
              This is how your name appears on invoices
            </div>
          </div>
        </div>
      )}

      {activeTab === "templates" && (
        <div>
          {showAddTemplate && (
            <div className="modal-bg" onClick={() => setShowAddTemplate(false)}>
              <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-ttl">New Template</div>
                <div className="modal-sub">
                  Save a set of line items you use frequently
                </div>
                <div className="fg mb4">
                  <label>Template name</label>
                  <input
                    placeholder="Web Development Package"
                    value={tplForm.name}
                    onChange={(e) =>
                      setTplForm((p) => ({ ...p, name: e.target.value }))
                    }
                  />
                </div>
                {tplForm.items.map((it, idx) => (
                  <div key={idx} className="fgrid mb2">
                    <div className="fg">
                      <label>Description</label>
                      <input
                        placeholder="Service"
                        value={it.desc}
                        onChange={(e) =>
                          setTplForm((p) => ({
                            ...p,
                            items: p.items.map((x, i) =>
                              i === idx ? { ...x, desc: e.target.value } : x
                            ),
                          }))
                        }
                      />
                    </div>
                    <div className="fg">
                      <label>Qty</label>
                      <input
                        type="number"
                        min="1"
                        value={it.qty}
                        onChange={(e) =>
                          setTplForm((p) => ({
                            ...p,
                            items: p.items.map((x, i) =>
                              i === idx ? { ...x, qty: e.target.value } : x
                            ),
                          }))
                        }
                      />
                    </div>
                  </div>
                ))}
                <button
                  className="btn bg btn-sm mb4"
                  onClick={() =>
                    setTplForm((p) => ({
                      ...p,
                      items: [...p.items, { desc: "", qty: 1, price: "" }],
                    }))
                  }
                >
                  <Icon n="plus" s={12} />
                  Add item
                </button>
                <div className="row">
                  <button
                    className="btn bp btn-full"
                    onClick={addTemplate}
                    disabled={!tplForm.name}
                  >
                    <Icon n="check" s={13} c="#fff" />
                    Save Template
                  </button>
                  <button
                    className="btn bs"
                    onClick={() => setShowAddTemplate(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginBottom: 16,
            }}
          >
            <button
              className="btn bp btn-sm"
              onClick={() => setShowAddTemplate(true)}
            >
              <Icon n="plus" s={13} c="#fff" />
              New Template
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {templates.map((t) => (
              <div
                key={t.id}
                className="card"
                style={{ display: "flex", alignItems: "center", gap: 14 }}
              >
                <div
                  className="af-icon b-gray"
                  style={{ width: 36, height: 36 }}
                >
                  <Icon n="template" s={16} />
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: 14,
                      color: "var(--tx)",
                    }}
                  >
                    {t.name}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--tx3)" }}>
                    {t.items.length} line items:{" "}
                    {t.items
                      .map((i) => i.desc)
                      .filter(Boolean)
                      .join(", ")}
                  </div>
                </div>
                <button
                  className="btn bd btn-sm"
                  onClick={() =>
                    setTemplates((p) => p.filter((x) => x.id !== t.id))
                  }
                >
                  <Icon n="trash" s={12} />
                  Delete
                </button>
              </div>
            ))}
            {templates.length === 0 && (
              <div className="empty">
                <Icon n="template" s={40} c="var(--tx3)" />
                <p>
                  No templates yet. Create one to speed up invoice creation.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "notifications" && (
        <div className="card" style={{ maxWidth: 520 }}>
          <div className="card-ttl">Email Notifications</div>
          {[
            [
              "Invoice viewed by client",
              "Get notified when your client opens the invoice link",
              true,
            ],
            [
              "Invoice downloaded",
              "Get notified when your client downloads the PDF",
              true,
            ],
            [
              "Invoice paid",
              "Get notified when you mark an invoice as paid",
              true,
            ],
            [
              "Overdue reminders",
              "Automatically send your client reminders on day 1, 7, and 14 after due date",
              false,
            ],
            [
              "Weekly summary",
              "Receive a weekly summary of your invoice activity",
              false,
            ],
          ].map(([l, sub, def]) => {
            const [on, setOn] = useState(def);
            return (
              <div
                key={l}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  padding: "12px 0",
                  borderBottom: "1px solid var(--bd)",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: "var(--tx)",
                    }}
                  >
                    {l}
                  </div>
                  <div
                    style={{ fontSize: 11, color: "var(--tx3)", marginTop: 2 }}
                  >
                    {sub}
                  </div>
                </div>
                <div
                  style={{
                    position: "relative",
                    width: 36,
                    height: 20,
                    background: on ? "var(--g)" : "var(--bd2)",
                    borderRadius: 10,
                    cursor: "pointer",
                    transition: "background .15s",
                    flexShrink: 0,
                    marginLeft: 12,
                  }}
                  onClick={() => setOn((p) => !p)}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: 2,
                      left: on ? 16 : 2,
                      width: 16,
                      height: 16,
                      borderRadius: "50%",
                      background: "#fff",
                      transition: "left .15s",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === "billing" && (
        <div className="card" style={{ maxWidth: 460 }}>
          <div className="card-ttl">Current Plan</div>
          <div
            style={{
              background: "linear-gradient(135deg,var(--glt),#f0fdf4)",
              border: "1.5px solid var(--gmid)",
              borderRadius: "var(--r)",
              padding: "16px 18px",
              marginBottom: 16,
            }}
          >
            <div style={{ fontWeight: 700, fontSize: 16, color: "var(--gdk)" }}>
              Free Plan
            </div>
            <div style={{ fontSize: 12, color: "var(--tx3)", marginTop: 3 }}>
              10 invoices/month {"\u00b7"} Basic features
            </div>
          </div>
          <div
            style={{
              fontSize: 13,
              color: "var(--tx2)",
              marginBottom: 16,
              lineHeight: 1.6,
            }}
          >
            Upgrade to Pro for unlimited invoices, recurring invoices, automatic
            reminders, and team access.
          </div>
          <button className="btn bp" onClick={() => toast("Coming soon!")}>
            <Icon n="star" s={13} c="#fff" />
            Upgrade to Pro
          </button>
        </div>
      )}
    </div>
  );
}

// -- APP ROOT ------------------------------------------------------------------
export default function App() {
  const [view, setView] = useState("dashboard");
  const [invoices, setInvoices] = useState(DEMO_INVOICES);
  const [clients, setClients] = useState(DEMO_CLIENTS);
  const [templates, setTemplates] = useState(DEMO_TEMPLATES);
  const [activeInvoice, setActiveInvoice] = useState(null);
  const [sbOpen, setSbOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  const showToast = (msg) => {
    setToastMsg(null);
    setTimeout(() => setToastMsg(msg), 50);
  };

  const overdue = invoices.filter((i) => isOverdue(i)).length;
  const drafts = invoices.filter((i) => i.status === "draft").length;

  function go(id) {
    setView(id);
    setActiveInvoice(null);
    setSbOpen(false);
  }
  function onCreated(inv) {
    setInvoices((p) => [inv, ...p]);
    setActiveInvoice(inv);
    setView("detail");
    setSbOpen(false);
    showToast("Invoice created");
  }
  function onUpdate(inv) {
    setInvoices((p) => p.map((i) => (i.id === inv.id ? inv : i)));
    setActiveInvoice(inv);
  }
  function viewInvoice(inv) {
    setActiveInvoice(inv);
    setView("detail");
  }

  const NAV = [
    { id: "dashboard", lbl: "Dashboard", icon: "grid" },
    {
      id: "invoices",
      lbl: "Invoices",
      icon: "file",
      badge: overdue > 0 ? overdue : null,
    },
    { id: "clients", lbl: "Clients", icon: "users" },
    { id: "settings", lbl: "Settings", icon: "settings" },
  ];

  const render = () => {
    if (view === "create")
      return (
        <CreateInvoice
          clients={clients}
          templates={templates}
          onCreated={onCreated}
          onCancel={() => setView("dashboard")}
        />
      );
    if (view === "detail" && activeInvoice)
      return (
        <InvoiceDetail
          invoice={activeInvoice}
          onBack={() => {
            setActiveInvoice(null);
            setView("invoices");
          }}
          onUpdate={onUpdate}
          toast={showToast}
        />
      );
    if (view === "client-view" && activeInvoice)
      return (
        <ClientInvoiceView
          invoice={activeInvoice}
          onBack={() => setView("detail")}
        />
      );
    if (view === "invoices")
      return (
        <InvoiceList
          invoices={invoices}
          onNew={() => setView("create")}
          onView={viewInvoice}
        />
      );
    if (view === "clients")
      return (
        <ClientsPage
          clients={clients}
          setClients={setClients}
          invoices={invoices}
          toast={showToast}
        />
      );
    if (view === "settings")
      return (
        <SettingsPage
          templates={templates}
          setTemplates={setTemplates}
          toast={showToast}
        />
      );
    return (
      <Dashboard
        invoices={invoices}
        onNew={() => setView("create")}
        onView={viewInvoice}
      />
    );
  };

  return (
    <>
      <style>{S}</style>
      {toastMsg && <Toast msg={toastMsg} onClose={() => setToastMsg(null)} />}
      <div className="app">
        <div
          className={"overlay" + (sbOpen ? " open" : "")}
          onClick={() => setSbOpen(false)}
        />
        <div className={"sb" + (sbOpen ? " open" : "")}>
          <div className="sb-top">
            <div className="sb-mark">I</div>
            <div style={{ flex: 1 }}>
              <div className="sb-name">InvoiceApp</div>
              <div className="sb-ver">v1.0 {"\u00b7"} Free plan</div>
            </div>
            <button className="sb-close" onClick={() => setSbOpen(false)}>
              <Icon n="close" s={17} />
            </button>
          </div>
          <nav className="sb-nav">
            {NAV.map((n) => (
              <button
                key={n.id}
                className={
                  "ni" +
                  (view === n.id || (view === "detail" && n.id === "invoices")
                    ? " on"
                    : "")
                }
                onClick={() => go(n.id)}
              >
                <Icon
                  n={n.icon}
                  s={15}
                  c={view === n.id ? "var(--gdk)" : "var(--tx3)"}
                />
                {n.lbl}
                {n.badge && <span className="ni-badge">{n.badge}</span>}
              </button>
            ))}
            <div className="sb-div" />
            <button
              className={"ni" + (view === "create" ? " on" : "")}
              onClick={() => {
                setView("create");
                setSbOpen(false);
              }}
            >
              <Icon
                n="plus"
                s={15}
                c={view === "create" ? "var(--gdk)" : "var(--tx3)"}
              />
              New Invoice
            </button>
            {activeInvoice && (
              <button
                className={"ni" + (view === "detail" ? " on" : "")}
                onClick={() => {
                  setView("detail");
                  setSbOpen(false);
                }}
              >
                <Icon
                  n="file"
                  s={15}
                  c={view === "detail" ? "var(--gdk)" : "var(--tx3)"}
                />
                <span
                  style={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {activeInvoice.id}
                </span>
              </button>
            )}
            {activeInvoice && activeInvoice.linkId && (
              <button
                className={"ni" + (view === "client-view" ? " on" : "")}
                onClick={() => {
                  setView("client-view");
                  setSbOpen(false);
                }}
              >
                <Icon
                  n="eye"
                  s={15}
                  c={view === "client-view" ? "var(--gdk)" : "var(--tx3)"}
                />
                Client View
              </button>
            )}
          </nav>
          <div className="sb-user">
            <div className="av">LE</div>
            <div style={{ overflow: "hidden", flex: 1 }}>
              <div className="av-name">Lucky Eze</div>
              <div className="av-plan">DevCraft Studio</div>
            </div>
          </div>
        </div>

        <div className="main">
          <div className="topbar">
            <div className="tb-logo">
              <div
                className="sb-mark"
                style={{ width: 27, height: 27, fontSize: 12 }}
              >
                I
              </div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 800,
                  color: "var(--tx)",
                  letterSpacing: "-.02em",
                }}
              >
                InvoiceApp
              </div>
            </div>
            <button className="tb-btn" onClick={() => setSbOpen(true)}>
              <Icon n="menu" s={20} />
            </button>
          </div>
          {render()}
        </div>
      </div>
    </>
  );
}
