import { useState } from "react";
import Icon from "../shared/Icon";
import { useTemplates, useTemplateMutations } from "../../hooks/useTemplates";
import type { AppTemplate } from "../../types";

function TemplateModal({
  initial,
  onSave,
  onClose,
  title,
}: {
  initial?: AppTemplate;
  onSave: (data: Omit<AppTemplate, "id">) => Promise<void>;
  onClose: () => void;
  title: string;
}) {
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    items: initial?.items.length
      ? initial.items.map((i) => ({
          desc: i.desc,
          qty: i.qty,
          price: i.price,
        }))
      : [{ desc: "", qty: 1, price: "" as string | number }],
  });
  const [saving, setSaving] = useState(false);

  async function submit() {
    if (!form.name) return;
    setSaving(true);
    try {
      await onSave(form);
      onClose();
    } catch {
      setSaving(false);
    }
  }

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-ttl">{title}</div>
        <div className="modal-sub">
          Save a set of line items you use frequently
        </div>
        <div className="fg mb4">
          <label>Template name</label>
          <input
            placeholder="Web Development Package"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          />
        </div>
        {form.items.map((it, idx) => (
          <div key={idx} className="fgrid mb2">
            <div className="fg">
              <label>Description</label>
              <input
                placeholder="Service"
                value={it.desc}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    items: p.items.map((x, i) =>
                      i === idx ? { ...x, desc: e.target.value } : x
                    ),
                  }))
                }
              />
            </div>
            <div className="fg">
              <label>Qty</label>
              <input
                type="number"
                min="1"
                value={it.qty}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    items: p.items.map((x, i) =>
                      i === idx ? { ...x, qty: Number(e.target.value) } : x
                    ),
                  }))
                }
              />
            </div>
          </div>
        ))}
        <button
          className="btn bg btn-sm mb4"
          onClick={() =>
            setForm((p) => ({
              ...p,
              items: [
                ...p.items,
                { desc: "", qty: 1, price: "" as string | number },
              ],
            }))
          }
        >
          <Icon n="plus" s={12} /> Add item
        </button>
        <div className="row">
          <button
            className="btn bp btn-full"
            onClick={submit}
            disabled={!form.name || saving}
          >
            <Icon n="check" s={13} c="#fff" />{" "}
            {saving ? "Saving…" : initial ? "Save Changes" : "Save Template"}
          </button>
          <button className="btn bs" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TemplatesTab() {
  const { templates } = useTemplates();
  const { addTemplate, updateTemplate, deleteTemplate, showToast } =
    useTemplateMutations();
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<AppTemplate | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleAdd(data: Omit<AppTemplate, "id">) {
    await addTemplate(data);
    showToast("Template created");
  }

  async function handleEdit(data: Omit<AppTemplate, "id">) {
    if (!editing) return;
    await updateTemplate(editing.id, data);
    showToast("Template updated");
    setEditing(null);
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await deleteTemplate(id);
      showToast("Template deleted");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      {showAdd && (
        <TemplateModal
          onSave={handleAdd}
          onClose={() => setShowAdd(false)}
          title="New Template"
        />
      )}
      {editing && (
        <TemplateModal
          initial={editing}
          onSave={handleEdit}
          onClose={() => setEditing(null)}
          title="Edit Template"
        />
      )}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: 16,
        }}
      >
        <button className="btn bp btn-sm" onClick={() => setShowAdd(true)}>
          <Icon n="plus" s={13} c="#fff" /> New Template
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {templates.map((t) => (
          <div
            key={t.id}
            className="card"
            style={{ display: "flex", alignItems: "center", gap: 14 }}
          >
            <div className="af-icon b-gray" style={{ width: 36, height: 36 }}>
              <Icon n="template" s={16} />
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{ fontWeight: 600, fontSize: 14, color: "var(--tx)" }}
              >
                {t.name}
              </div>
              <div style={{ fontSize: 12, color: "var(--tx3)" }}>
                {t.items.length} line items:{" "}
                {t.items
                  .map((i) => i.desc)
                  .filter(Boolean)
                  .join(", ")}
              </div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button className="btn bg btn-sm" onClick={() => setEditing(t)}>
                <Icon n="settings" s={12} /> Edit
              </button>
              <button
                className="btn bd btn-sm"
                onClick={() => handleDelete(t.id)}
                disabled={deletingId === t.id}
              >
                {deletingId === t.id ? (
                  <Icon n="spin" s={12} />
                ) : (
                  <Icon n="trash" s={12} />
                )}
                {deletingId === t.id ? " Deleting…" : " Delete"}
              </button>
            </div>
          </div>
        ))}
        {templates.length === 0 && (
          <div className="empty">
            <Icon n="template" s={40} c="var(--tx3)" />
            <p>No templates yet. Create one to speed up invoice creation.</p>
          </div>
        )}
      </div>
    </div>
  );
}
