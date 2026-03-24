export const currencySymbol = (c: string) =>
  ((
    {
      USD: "$",
      GBP: "£",
      EUR: "€",
      CAD: "C$",
      AUD: "A$",
      NGN: "₦",
      GHS: "₵",
      KES: "KSh",
      ZAR: "R",
      EGP: "E£",
      UGX: "USh",
      TZS: "TSh",
      XOF: "CFA",
    } as Record<string, string>
  )[c] ?? c + " ");

export const fmt = (n: number | string, d = 2) =>
  parseFloat(String(n || 0)).toLocaleString("en", {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  });

/** Format a number in the freelancer's home currency locale. */
export const fmtHome = (n: number | string, currency = "NGN") =>
  parseFloat(String(n || 0)).toLocaleString("en", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
export const ts = () =>
  new Date().toLocaleString("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export const dateStr = (d: string | Date) =>
  new Date(d).toLocaleDateString("en-NG", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

export const isOverdue = (inv: { dueDate?: string; status: string }) =>
  !!inv.dueDate &&
  new Date(inv.dueDate) < new Date() &&
  !["paid", "cancelled", "draft"].includes(inv.status);

export const subtotal = (
  items: { price: number | string; qty: number | string }[]
) =>
  items.reduce(
    (s, i) =>
      s + (parseFloat(String(i.price)) || 0) * (parseInt(String(i.qty)) || 1),
    0
  );

export function calcTotal(
  items: { price: number | string; qty: number | string }[],
  tax: { rate: number } | null,
  deposit: number
) {
  const sub = subtotal(items);
  const taxAmt = tax ? (sub * tax.rate) / 100 : 0;
  const gross = sub + taxAmt;
  const dep = deposit ? (gross * deposit) / 100 : 0;
  return { sub, taxAmt, gross, dep, total: deposit ? dep : gross };
}
