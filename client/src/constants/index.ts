export const CURRENCIES = [
  "USD",
  "GBP",
  "EUR",
  "CAD",
  "AUD",
  "NGN",
  "GHS",
  "KES",
  "ZAR",
  "EGP",
  "UGX",
  "TZS",
  "XOF",
];

export const CURRENCY_NAMES: Record<string, string> = {
  USD: "US Dollar",
  GBP: "British Pound",
  EUR: "Euro",
  CAD: "Canadian Dollar",
  AUD: "Australian Dollar",
  NGN: "Nigerian Naira",
  GHS: "Ghanaian Cedi",
  KES: "Kenyan Shilling",
  ZAR: "South African Rand",
  EGP: "Egyptian Pound",
  UGX: "Ugandan Shilling",
  TZS: "Tanzanian Shilling",
  XOF: "West African CFA Franc",
};

// All rates expressed as units-per-1-USD (static fallback; refreshed by /api/rates)
const USD_BASE: Record<string, number> = {
  USD: 1,
  GBP: 0.79,
  EUR: 0.92,
  CAD: 1.36,
  AUD: 1.55,
  NGN: 1618.5,
  GHS: 15.7,
  KES: 129.5,
  ZAR: 18.4,
  EGP: 50.5,
  UGX: 3750,
  TZS: 2640,
  XOF: 603,
};

/** Returns how many units of `to` equal 1 unit of `from`. */
export function getRate(from: string, to: string): number {
  if (from === to) return 1;
  const f = USD_BASE[from] ?? 1;
  const t = USD_BASE[to] ?? 1;
  return t / f;
}

/** Freelancer profile used for home-currency display across the app. */
export const USER = {
  name: "Lucky Eze",
  business: "DevCraft Studio",
  email: "lucky@devcraft.ng",
  homeCurrency: "NGN",
};

export const STATUS_META: Record<
  string,
  { label: string; color: string; dot: string }
> = {
  draft: { label: "Draft", color: "gray", dot: "#94a3b8" },
  sent: { label: "Sent", color: "blue", dot: "#3b82f6" },
  viewed: { label: "Viewed", color: "purple", dot: "#8b5cf6" },
  overdue: { label: "Overdue", color: "red", dot: "#ef4444" },
  paid: { label: "Paid", color: "green", dot: "#16a34a" },
  cancelled: { label: "Cancelled", color: "gray", dot: "#94a3b8" },
  disputed: { label: "Disputed", color: "amber", dot: "#f59e0b" },
  partial: { label: "Partial", color: "teal", dot: "#0d9488" },
};

export const TAX_TYPES = [
  { id: "vat", label: "VAT", default: 7.5 },
  { id: "wht", label: "WHT (Withholding Tax)", default: 5 },
  { id: "custom", label: "Custom", default: 10 },
];

export const PAYMENT_TERMS_PRESETS = [
  "Due on receipt",
  "Net 7",
  "Net 14",
  "Net 30",
  "Net 60",
  "50% upfront, 50% on delivery",
];

export const INVOICE_TYPES = [
  { id: "standard", label: "Standard Invoice" },
  { id: "proforma", label: "Proforma Invoice" },
  { id: "deposit", label: "Deposit Invoice" },
  { id: "credit", label: "Credit Note" },
];
