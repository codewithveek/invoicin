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
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-hd">
          <div className="modal-ttl">Edit Invoice</div>
          <button className="btn-icon" onClick={onClose}>
            <Icon n="close" s={16} />
          </button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "var(--tx2)",
                marginBottom: 4,
                display: "block",
              }}
            >
              Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="input"
              style={{ width: "100%" }}
            />
          </div>
          <div>
            <label
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "var(--tx2)",
                marginBottom: 4,
                display: "block",
              }}
            >
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="input"
              rows={4}
              style={{ width: "100%", resize: "vertical" }}
              placeholder="Payment instructions, terms, etc."
            />
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
          <button className="btn bg btn-full" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn bp btn-full"
            onClick={handleSave}
            disabled={saving}
            style={saving ? { opacity: 0.6, pointerEvents: "none" } : {}}
          >
            {saving && <Icon n="spin" s={14} c="#fff" />}
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
