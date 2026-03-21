import { useState } from "react";
import Icon from "./Icon";
import InvoicePreviewCard from "./InvoicePreviewCard";
import {
  currencySymbol,
  fmt,
  fmtNGN,
  wait,
  uid,
  linkId,
  ts,
  calcTotal,
} from "../utils";
import {
  CURRENCIES,
  CURRENCY_NAMES,
  MOCK_RATES,
  TAX_TYPES,
  PAYMENT_TERMS_PRESETS,
  INVOICE_TYPES,
} from "../constants";

interface CreateInvoiceProps {
  clients: any[];
  templates: any[];
  onCreated: (inv: any) => void;
  onCancel: () => void;
}

export default function CreateInvoice({
  clients,
  templates,
  onCreated,
  onCancel,
}: CreateInvoiceProps) {
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
  const [tax, setTax] = useState<{ type: string; rate: number } | null>(null);
  const [taxEnabled, setTaxEnabled] = useState(false);
  const [depositEnabled] = useState(false);

  const setItem = (idx: number, f: string, v: any) =>
    setItems((p) => p.map((it, i) => (i === idx ? { ...it, [f]: v } : it)));

  const { sub, taxAmt, gross, dep, total } = calcTotal(
    items,
    taxEnabled ? tax : null,
    depositEnabled ? form.deposit : 0
  );
  const S2 = currencySymbol(form.currency);
  const canNext = form.clientName && items.some((i) => i.desc && i.price);

  function applyTemplate(t: any) {
    setItems(t.items.map((i: any) => ({ ...i })));
    setShowTemplatePicker(false);
  }
  function applyClient(c: any) {
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
              <Icon n="chevL" s={13} /> Edit
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
                  <Icon n="users" s={12} /> Address Book
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
                      style={{ flex: 1, minWidth: 140 }}
                      onChange={(e) => {
                        const tt = TAX_TYPES.find(
                          (t) => t.id === e.target.value
                        )!;
                        setTax({ type: tt.id, rate: tt.default });
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
                          setTax((p) => ({
                            ...p!,
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
                      {"₦"}
                      {fmtNGN(total * MOCK_RATES[form.currency])}
                    </span>
                  </div>
                  <div style={{ fontSize: 10, color: "var(--tx3)" }}>
                    at approx. {"₦"}
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
                    <Icon n="spin" s={14} c="#fff" /> Creating...
                  </>
                ) : (
                  <>
                    <Icon n="zap" s={14} c="#fff" /> Create Invoice
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
