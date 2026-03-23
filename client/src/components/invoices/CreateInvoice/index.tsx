import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "../../shared/Icon";
import FormStep from "./FormStep";
import PreviewStep from "./PreviewStep";
import { ClientPickerModal, TemplatePickerModal } from "./PickerModals";
import { calcTotal } from "../../../utils";
import { invoicesApi } from "../../../api/invoices.api";
import { useInvoiceMutations } from "../../../hooks/useInvoices";
import { useClients } from "../../../hooks/useClients";
import { useTemplates } from "../../../hooks/useTemplates";
import type {
  AppClient,
  AppTemplate,
  InvoiceItem,
  InvoiceType,
} from "../../../types";

export default function CreateInvoice() {
  const { clients } = useClients();
  const { templates } = useTemplates();
  const { createInvoice, showToast } = useInvoiceMutations();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [busy, setBusy] = useState(false);
  const [showClientPicker, setShowClientPicker] = useState(false);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [form, setForm] = useState({
    type: "standard" as InvoiceType,
    currency: "USD",
    dueDate: "",
    terms: "Net 14",
    notes: "",
    deposit: 0,
    clientName: "",
    clientEmail: "",
    clientAddress: "",
  });
  const [items, setItems] = useState<InvoiceItem[]>([
    { desc: "", qty: 1, price: "" },
  ]);
  const [tax, setTax] = useState<{ type: string; rate: number } | null>(null);
  const [taxEnabled, setTaxEnabled] = useState(false);
  const [depositEnabled] = useState(false);

  const { taxAmt, total } = calcTotal(
    items,
    taxEnabled ? tax : null,
    depositEnabled ? form.deposit : 0
  );

  function applyTemplate(t: AppTemplate) {
    setItems(t.items.map((i) => ({ ...i })));
    setShowTemplatePicker(false);
  }

  function applyClient(c: AppClient) {
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
    try {
      const cleanedItems = items
        .filter((i) => i.desc && i.price)
        .map((i) => ({
          desc: i.desc,
          qty: i.qty,
          price: Number(i.price),
        }));
      const inv = await invoicesApi.create({
        type: form.type,
        clientName: form.clientName,
        clientEmail: form.clientEmail || undefined,
        clientAddress: form.clientAddress || undefined,
        currency: form.currency,
        items: cleanedItems,
        taxType: taxEnabled && tax ? tax.type : undefined,
        taxRate: taxEnabled && tax ? tax.rate : undefined,
        taxAmount: taxEnabled ? taxAmt : undefined,
        deposit: depositEnabled ? form.deposit : undefined,
        total,
        dueDate: form.dueDate || undefined,
        terms: form.terms || undefined,
        notes: form.notes || undefined,
      });
      createInvoice(inv);
      showToast("Invoice created");
      navigate("/invoices/" + inv.id);
    } catch {
      showToast("Failed to create invoice");
    } finally {
      setBusy(false);
    }
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
          <button className="btn bs" onClick={() => navigate(-1)}>
            Cancel
          </button>
        </div>
      </div>

      {showClientPicker && (
        <ClientPickerModal
          clients={clients}
          onSelect={applyClient}
          onClose={() => setShowClientPicker(false)}
        />
      )}

      {showTemplatePicker && (
        <TemplatePickerModal
          templates={templates}
          onSelect={applyTemplate}
          onClose={() => setShowTemplatePicker(false)}
        />
      )}

      {step === 1 && (
        <FormStep
          form={form}
          items={items}
          tax={tax}
          taxEnabled={taxEnabled}
          depositEnabled={depositEnabled}
          onFormChange={(patch) => setForm((p) => ({ ...p, ...patch }))}
          onItemChange={(idx, field, value) =>
            setItems((p) =>
              p.map((it, i) =>
                i === idx ? ({ ...it, [field]: value } as InvoiceItem) : it
              )
            )
          }
          onItemAdd={() =>
            setItems((p) => [...p, { desc: "", qty: 1, price: "" }])
          }
          onItemRemove={(idx) => setItems((p) => p.filter((_, i) => i !== idx))}
          onTaxToggle={setTaxEnabled}
          onTaxChange={setTax}
          onOpenClientPicker={() => setShowClientPicker(true)}
          onOpenTemplatePicker={() => setShowTemplatePicker(true)}
          onNext={() => setStep(2)}
        />
      )}

      {step === 2 && (
        <PreviewStep
          form={form}
          items={items}
          tax={tax}
          taxEnabled={taxEnabled}
          taxAmt={taxAmt}
          total={total}
          busy={busy}
          onGenerate={generate}
          onBack={() => setStep(1)}
        />
      )}
    </div>
  );
}
