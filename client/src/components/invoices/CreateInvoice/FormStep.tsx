import Icon from "../../shared/Icon";
import {
  CURRENCIES,
  CURRENCY_NAMES,
  TAX_TYPES,
  PAYMENT_TERMS_PRESETS,
  INVOICE_TYPES,
} from "../../../constants";
import { currencySymbol, fmt, fmtHome, calcTotal } from "../../../utils";
import { useRate } from "../../../hooks/useRates";
import { useApp } from "../../../context/AppContext";
import type { InvoiceItem, InvoiceType } from "../../../types";

interface FormState {
  type: InvoiceType;
  currency: string;
  dueDate: string;
  terms: string;
  notes: string;
  deposit: number;
  clientName: string;
  clientEmail: string;
  clientAddress: string;
}

interface FormStepProps {
  form: FormState;
  items: InvoiceItem[];
  tax: { type: string; rate: number } | null;
  taxEnabled: boolean;
  depositEnabled: boolean;
  onFormChange: (patch: Partial<FormState>) => void;
  onItemChange: (
    idx: number,
    field: keyof InvoiceItem,
    value: string | number
  ) => void;
  onItemAdd: () => void;
  onItemRemove: (idx: number) => void;
  onTaxToggle: (enabled: boolean) => void;
  onTaxChange: (tax: { type: string; rate: number }) => void;
  onOpenClientPicker: () => void;
  onOpenTemplatePicker: () => void;
  onNext: () => void;
}

export default function FormStep({
  form,
  items,
  tax,
  taxEnabled,
  depositEnabled,
  onFormChange,
  onItemChange,
  onItemAdd,
  onItemRemove,
  onTaxToggle,
  onTaxChange,
  onOpenClientPicker,
  onOpenTemplatePicker,
  onNext,
}: FormStepProps) {
  const { sub, taxAmt, gross, dep, total } = calcTotal(
    items,
    taxEnabled ? tax : null,
    depositEnabled ? form.deposit : 0
  );
  const S2 = currencySymbol(form.currency);
  const canNext = form.clientName && items.some((i) => i.desc && i.price);
  const { user } = useApp();
  const homeCurrency = user?.homeCurrency ?? "USD";
  const rate = useRate(form.currency, homeCurrency);

  return (
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
                onClick={() => onFormChange({ type: t.id as InvoiceType })}
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
                    onFormChange({ deposit: parseFloat(e.target.value) || 50 })
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
              Credit notes reduce a previously issued invoice. The total will
              appear as a negative amount.
            </div>
          )}
        </div>

        {/* Bill To */}
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
            <button className="btn bg btn-sm" onClick={onOpenClientPicker}>
              <Icon n="users" s={12} /> Address Book
            </button>
          </div>
          <div className="fgrid">
            <div className="fg">
              <label>Client name</label>
              <input
                placeholder="Acme Corp"
                value={form.clientName}
                onChange={(e) => onFormChange({ clientName: e.target.value })}
              />
            </div>
            <div className="fg">
              <label>Email</label>
              <input
                type="email"
                placeholder="billing@acmecorp.io"
                value={form.clientEmail}
                onChange={(e) => onFormChange({ clientEmail: e.target.value })}
              />
            </div>
            <div className="fg full">
              <label>Address (optional)</label>
              <input
                placeholder="123 Main St, San Francisco, CA"
                value={form.clientAddress}
                onChange={(e) =>
                  onFormChange({ clientAddress: e.target.value })
                }
              />
            </div>
          </div>
        </div>

        {/* Invoice details + line items */}
        <div className="card">
          <div className="fgrid mb4">
            <div className="fg">
              <label>Currency</label>
              <select
                value={form.currency}
                onChange={(e) => onFormChange({ currency: e.target.value })}
              >
                {CURRENCIES.map((c) => (
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
                onChange={(e) => onFormChange({ dueDate: e.target.value })}
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
                    className={`btn btn-sm ${form.terms === t ? "bp" : "bg"}`}
                    onClick={() => onFormChange({ terms: t })}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <input
                placeholder="Payment terms"
                value={form.terms}
                onChange={(e) => onFormChange({ terms: e.target.value })}
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
            <button className="btn bg btn-sm" onClick={onOpenTemplatePicker}>
              <Icon n="template" s={12} /> Templates
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
                (parseFloat(String(it.price)) || 0) *
                (parseInt(String(it.qty)) || 1);
              return (
                <div className="li-row" key={idx}>
                  <input
                    placeholder="Service description"
                    value={it.desc}
                    onChange={(e) => onItemChange(idx, "desc", e.target.value)}
                  />
                  <input
                    type="number"
                    min="1"
                    value={it.qty}
                    onChange={(e) => onItemChange(idx, "qty", e.target.value)}
                    style={{ textAlign: "center" }}
                  />
                  <div className="ipw">
                    <span className="ipp">{S2}</span>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={it.price}
                      onChange={(e) =>
                        onItemChange(idx, "price", e.target.value)
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
                    onClick={() => onItemRemove(idx)}
                    disabled={items.length === 1}
                  >
                    <Icon n="trash" s={11} />
                  </button>
                </div>
              );
            })}
            <div className="li-ft">
              <button className="btn bg btn-sm" onClick={onItemAdd}>
                <Icon n="plus" s={12} /> Add line
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
                onChange={(e) => onTaxToggle(e.target.checked)}
                style={{ width: 15, height: 15, accentColor: "var(--g)" }}
              />
              Add Tax
            </label>
            {taxEnabled && (
              <div
                style={{ display: "flex", gap: 8, flex: 1, flexWrap: "wrap" }}
              >
                <select
                  value={tax?.type || "vat"}
                  style={{ flex: 1, minWidth: 140 }}
                  onChange={(e) => {
                    const tt = TAX_TYPES.find((t) => t.id === e.target.value)!;
                    onTaxChange({ type: tt.id, rate: tt.default });
                  }}
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
                      onTaxChange({
                        type: tax?.type || "vat",
                        rate: parseFloat(e.target.value) || 0,
                      })
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
                  {TAX_TYPES.find((t) => t.id === tax.type)?.label} ({tax.rate}
                  %)
                </span>
                <span className="mono">
                  {S2}
                  {fmt(taxAmt)}
                </span>
              </div>
            )}
            {form.type === "deposit" && (
              <>
                <div className="tot-row">
                  <span style={{ color: "var(--tx2)" }}>Gross total</span>
                  <span className="mono">
                    {S2}
                    {fmt(gross)}
                  </span>
                </div>
                <div className="tot-row">
                  <span style={{ color: "var(--pu)" }}>
                    Deposit ({form.deposit}%)
                  </span>
                  <span className="mono" style={{ color: "var(--pu)" }}>
                    {S2}
                    {fmt(dep)}
                  </span>
                </div>
              </>
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
              onChange={(e) => onFormChange({ notes: e.target.value })}
              style={{ resize: "none" }}
            />
          </div>
        </div>
      </div>

      {/* Sidebar summary */}
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
          <div style={{ fontSize: 11, color: "var(--tx3)", marginBottom: 12 }}>
            {CURRENCY_NAMES[form.currency]}
          </div>
          {total > 0 && form.currency !== homeCurrency && (
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
                <span style={{ color: "var(--tx3)" }}>Est. {homeCurrency}</span>
                <span
                  style={{
                    fontFamily: "var(--mo)",
                    fontWeight: 700,
                    color: "var(--gdk)",
                  }}
                >
                  {currencySymbol(homeCurrency)}
                  {fmtHome(total * rate)}
                </span>
              </div>
              <div style={{ fontSize: 10, color: "var(--tx3)" }}>
                at approx. {currencySymbol(homeCurrency)}
                {fmt(rate, 0)}/{form.currency}
              </div>
            </div>
          )}
        </div>
        <button
          className="btn bp btn-full btn-lg"
          disabled={!canNext}
          onClick={onNext}
        >
          Preview <Icon n="chevR" s={14} c="#fff" />
        </button>
      </div>
    </div>
  );
}
