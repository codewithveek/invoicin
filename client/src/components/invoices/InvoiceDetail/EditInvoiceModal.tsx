"use client";
import { useState } from "react";
import Icon from "../../shared/Icon";
import type { AppInvoice } from "../../../types";

interface EditInvoiceModalProps {
  inv: AppInvoice;
  onSave: (data: { notes?: string; dueDate?: string }) => Promise<void>;
  onClose: () => void;
}

export default function EditInvoiceModal({
  inv,
  onSave,
  onClose,
}: EditInvoiceModalProps) {
  const [notes, setNotes] = useState(inv.notes ?? "");
  const [dueDate, setDueDate] = useState(
    inv.dueDate ? String(inv.dueDate).split("T")[0] : ""
  );
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await onSave({
        notes: notes || undefined,
        dueDate: dueDate || undefined,
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-ttl">Edit Invoice</div>
        <div className="flex flex-col gap-3.5">
          <div>
            <label className="text-[12px] font-semibold text-tx2 mb-1 block">
              Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="input w-full"
            />
          </div>
          <div>
            <label className="text-[12px] font-semibold text-tx2 mb-1 block">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="input w-full resize-y"
              rows={4}
              placeholder="Payment instructions, terms, etc."
            />
          </div>
        </div>
        <div className="flex flex-col gap-2 mt-4">
          <button className="btn bg btn-full" onClick={onClose}>
            Cancel
          </button>
          <button
            className={`btn bp btn-full${
              saving ? " opacity-60 pointer-events-none" : ""
            }`}
            onClick={handleSave}
            disabled={saving}
          >
            {saving && <Icon n="spin" s={14} c="#fff" />}
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
