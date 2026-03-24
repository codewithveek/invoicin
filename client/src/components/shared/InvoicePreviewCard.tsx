import Icon from "./Icon";
import { currencySymbol, fmt, fmtHome, dateStr, calcTotal } from "../../utils";
import { getRate, TAX_TYPES } from "../../constants";
import type { AppInvoice } from "../../types";

interface InvoicePreviewCardProps {
  inv: AppInvoice;
  freelancer?: { name?: string; business?: string };
  /** Freelancer's home currency */
  homeCurrency?: string;
}

export default function InvoicePreviewCard({
  inv,
  freelancer,
  homeCurrency = "USD",
}: InvoicePreviewCardProps) {
  const S2 = currencySymbol(inv.currency);
  const { taxAmt, total } = calcTotal(inv.items, inv.tax, inv.deposit);

  const typeLabels: Record<string, string> = {
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
          {freelancer?.business || freelancer?.name || ""}
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
        {inv.currency !== homeCurrency && (
          <div className="inv-hd-ngn">
            {currencySymbol(homeCurrency)}
            {fmtHome(
              (inv.total || total) * getRate(inv.currency, homeCurrency)
            )}{" "}
            {homeCurrency} est.
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
              <div className="text-[11px] text-tx3 mt-px">
                {inv.client.email}
              </div>
            )}
            {inv.client.address && (
              <div className="text-[11px] text-tx3 mt-px">
                {inv.client.address}
              </div>
            )}
          </span>
        </div>

        <div className="inv-items">
          {inv.items.map((it, i: number) => (
            <div key={i} className="ii-row">
              <span>
                {it.desc}
                {it.qty > 1 && <span className="text-tx3"> x{it.qty}</span>}
              </span>
              <span className="font-mono font-semibold">
                {S2}
                {fmt(
                  (parseFloat(String(it.price)) || 0) *
                    (parseInt(String(it.qty)) || 1)
                )}
              </span>
            </div>
          ))}
          {inv.tax && (
            <div className="ii-row">
              <span className="text-tx3">
                {TAX_TYPES.find((t) => t.id === inv.tax?.type)?.label} (
                {inv.tax?.rate}%)
              </span>
              <span className="font-mono">
                {S2}
                {fmt(inv.taxAmt || taxAmt)}
              </span>
            </div>
          )}
          {inv.deposit > 0 && (
            <div className="ii-row">
              <span className="text-purple">Deposit ({inv.deposit}%)</span>
              <span className="font-mono text-purple">
                {S2}
                {fmt(inv.total || total)}
              </span>
            </div>
          )}
          <div className="ii-tot">
            <span>Total</span>
            <span className="font-mono">
              {inv.type === "credit" && "-"}
              {S2}
              {fmt(inv.total || total)}
            </span>
          </div>
        </div>

        {inv.notes && (
          <div className="px-3 py-[10px] bg-sf2 rounded-lg text-[12px] text-tx2 mb-3 leading-relaxed">
            {inv.notes}
          </div>
        )}
      </div>

      <div className="inv-stamp">
        <div className="inv-stamp-dot" />
        <div className="text-[11px] font-semibold text-brand-dark">
          Created with Invoicin
        </div>
        <div className="font-mono text-[10px] text-tx3 ml-auto">{inv.id}</div>
      </div>
    </div>
  );
}
