import Icon from "./Icon";
import { currencySymbol, fmt, fmtHome, dateStr, calcTotal } from "../utils";
import { getRate, TAX_TYPES, USER } from "../constants";
import type { AppInvoice } from "../types";

interface InvoicePreviewCardProps {
  inv: AppInvoice;
  freelancer?: { name?: string; business?: string };
  /** Freelancer's home currency; defaults to USER.homeCurrency */
  homeCurrency?: string;
}

export default function InvoicePreviewCard({
  inv,
  freelancer,
  homeCurrency = USER.homeCurrency,
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
          {inv.items.map((it, i: number) => (
            <div key={i} className="ii-row">
              <span>
                {it.desc}
                {it.qty > 1 && (
                  <span style={{ color: "var(--tx3)" }}> x{it.qty}</span>
                )}
              </span>
              <span style={{ fontFamily: "var(--mo)", fontWeight: 600 }}>
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
              <span style={{ color: "var(--tx3)" }}>
                {TAX_TYPES.find((t) => t.id === inv.tax?.type)?.label} (
                {inv.tax?.rate}%)
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
