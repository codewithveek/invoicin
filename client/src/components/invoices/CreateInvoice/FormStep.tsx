"use client";
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
    <div className="two-col grid grid-cols-[1fr_300px] gap-[18px] items-start">
      <div className="flex flex-col gap-4">
        {/* Invoice type */}
        <div className="card">
          <div className="card-ttl">Invoice Type</div>
          <div className="flex gap-2 flex-wrap">
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
            <div className="mt3 flex items-center gap-3">
              <span className="text-[13px] text-tx2">Deposit percentage</span>
              <div className="ipw w-[100px]">
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={form.deposit}
                  onChange={(e) =>
                    onFormChange({ deposit: parseFloat(e.target.value) || 50 })
                  }
                  className="pr-7"
                />
                <span className="absolute right-[11px] top-1/2 -translate-y-1/2 text-[13px] text-tx3">
                  %
                </span>
              </div>
            </div>
          )}
          {form.type === "credit" && (
            <div className="mt2 text-[12px] text-amber bg-amber-light px-3 py-2 rounded-lg">
              Credit notes reduce a previously issued invoice. The total will
              appear as a negative amount.
            </div>
          )}
        </div>

        {/* Bill To */}
        <div className="card">
          <div className="flex justify-between items-center mb-[14px]">
            <div className="card-ttl !m-0">Bill To</div>
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
              <div className="flex gap-[6px] flex-wrap mb-[6px]">
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
          <div className="flex justify-between items-center mb-[10px]">
            <label className="!m-0">Line Items</label>
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
                    className="text-center"
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
                  <span className="am-col mono text-[13px] font-semibold text-tx">
                    {S2}
                    {fmt(amt)}
                  </span>
                  <button
                    className="btn bg px-[5px] py-[5px]"
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
            className={`flex items-center gap-[10px] ${
              taxEnabled ? "mb-3" : ""
            }`}
          >
            <label className="!m-0 cursor-pointer flex items-center gap-[7px] normal-case text-[13px] font-medium text-tx2">
              <input
                type="checkbox"
                checked={taxEnabled}
                onChange={(e) => onTaxToggle(e.target.checked)}
                className="w-[15px] h-[15px] accent-brand"
              />
              Add Tax
            </label>
            {taxEnabled && (
              <div className="flex gap-2 flex-1 flex-wrap">
                <select
                  value={tax?.type || "vat"}
                  className="flex-1 min-w-[140px]"
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
                <div className="ipw w-[90px]">
                  <input
                    type="number"
                    value={tax?.rate || 7.5}
                    onChange={(e) =>
                      onTaxChange({
                        type: tax?.type || "vat",
                        rate: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="pr-6"
                  />
                  <span className="absolute right-[10px] top-1/2 -translate-y-1/2 text-[12px] text-tx3">
                    %
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Totals */}
          <div className="totals-box">
            <div className="tot-row">
              <span className="text-tx2">Subtotal</span>
              <span className="mono">
                {S2}
                {fmt(sub)}
              </span>
            </div>
            {taxEnabled && tax && (
              <div className="tot-row">
                <span className="text-tx2">
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
                  <span className="text-tx2">Gross total</span>
                  <span className="mono">
                    {S2}
                    {fmt(gross)}
                  </span>
                </div>
                <div className="tot-row">
                  <span className="text-purple">Deposit ({form.deposit}%)</span>
                  <span className="mono text-purple">
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
              className="resize-none"
            />
          </div>
        </div>
      </div>

      {/* Sidebar summary */}
      <div className="sticky top-6 flex flex-col gap-[14px]">
        <div className="card">
          <div className="card-ttl">Summary</div>
          <div className="font-mono text-[24px] font-bold text-tx tracking-[-0.03em] mb-[3px]">
            {S2}
            {fmt(total)}
          </div>
          <div className="text-[11px] text-tx3 mb-3">
            {CURRENCY_NAMES[form.currency]}
          </div>
          {total > 0 && form.currency !== homeCurrency && (
            <div className="px-3 py-[9px] bg-sf2 rounded-lg text-[12px]">
              <div className="flex justify-between mb-[3px]">
                <span className="text-tx3">Est. {homeCurrency}</span>
                <span className="font-mono font-bold text-brand-dark">
                  {currencySymbol(homeCurrency)}
                  {fmtHome(total * rate)}
                </span>
              </div>
              <div className="text-[10px] text-tx3">
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
