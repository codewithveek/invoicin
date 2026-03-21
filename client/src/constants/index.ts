export const CURRENCIES = ["USD", "GBP", "EUR", "CAD", "AUD", "NGN"];

export const CURRENCY_NAMES: Record<string, string> = {
  USD: "US Dollar",
  GBP: "British Pound",
  EUR: "Euro",
  CAD: "Canadian Dollar",
  AUD: "Australian Dollar",
  NGN: "Nigerian Naira",
};

export const MOCK_RATES: Record<string, number> = {
  USD: 1618.5,
  GBP: 2039.2,
  EUR: 1746.8,
  CAD: 1191.4,
  AUD: 1043.7,
  NGN: 1,
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
