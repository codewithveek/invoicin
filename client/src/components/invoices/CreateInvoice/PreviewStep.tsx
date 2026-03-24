import Icon from "../../shared/Icon";
import InvoicePreviewCard from "../../shared/InvoicePreviewCard";
import type { AppInvoice, InvoiceItem, InvoiceType } from "../../../types";

interface PreviewStepProps {
  form: {
    type: InvoiceType;
    currency: string;
    dueDate: string;
    terms: string;
    notes: string;
    deposit: number;
    clientName: string;
    clientEmail: string;
    clientAddress: string;
  };
  items: InvoiceItem[];
  tax: { type: string; rate: number } | null;
  taxEnabled: boolean;
  taxAmt: number;
  total: number;
  busy: boolean;
  freelancer?: { name?: string; business?: string };
  onGenerate: () => void;
  onBack?: () => void;
}

export default function PreviewStep({
  form,
  items,
  tax,
  taxEnabled,
  taxAmt,
  total,
  busy,
  freelancer,
  onGenerate,
}: PreviewStepProps) {
  const previewInv = {
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
  } as AppInvoice;

  return (
    <div className="two-col flex flex-wrap gap-6 items-start">
      <InvoicePreviewCard
        inv={previewInv}
        freelancer={freelancer}
        homeCurrency={form.currency}
      />
      <div className="flex flex-col gap-3 w-full max-w-[360px]">
        <div className="card">
          <div className="card-ttl">Looks good?</div>
          <p className="text-[13px] text-tx2 leading-relaxed mb-4">
            Once created, you can send this invoice by email or share the link
            directly.
          </p>
          <button
            className="btn bp btn-full btn-lg"
            onClick={onGenerate}
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
        <div className="px-[14px] py-3 bg-sf2 rounded-[var(--radius)] text-[12px] text-tx2 leading-relaxed">
          <strong>After creating,</strong> the invoice starts as a Draft. You
          can then send it by email or copy the shareable link.
        </div>
      </div>
    </div>
  );
}
