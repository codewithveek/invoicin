import { useState } from "react";
import Icon from "../shared/Icon";
import { useTemplates, useTemplateMutations } from "../../hooks/useTemplates";

export default function TemplatesTab() {
  const { templates } = useTemplates();
  const { addTemplate, deleteTemplate } = useTemplateMutations();
  const [showAddTemplate, setShowAddTemplate] = useState(false);
  const [tplForm, setTplForm] = useState({
    name: "",
    items: [{ desc: "", qty: 1, price: "" }],
  });

  function handleAdd() {
    if (!tplForm.name) return;
    addTemplate({ id: "t" + Date.now(), ...tplForm });
    setTplForm({ name: "", items: [{ desc: "", qty: 1, price: "" }] });
    setShowAddTemplate(false);
  }

  return (
    <div>
      {showAddTemplate && (
        <div className="modal-bg" onClick={() => setShowAddTemplate(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-ttl">New Template</div>
            <div className="modal-sub">
              Save a set of line items you use frequently
            </div>
            <div className="fg mb4">
              <label>Template name</label>
              <input
                placeholder="Web Development Package"
                value={tplForm.name}
                onChange={(e) =>
                  setTplForm((p) => ({ ...p, name: e.target.value }))
                }
              />
            </div>
            {tplForm.items.map((it, idx) => (
              <div key={idx} className="fgrid mb2">
                <div className="fg">
                  <label>Description</label>
                  <input
                    placeholder="Service"
                    value={it.desc}
                    onChange={(e) =>
                      setTplForm((p) => ({
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
                      setTplForm((p) => ({
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
                setTplForm((p) => ({
                  ...p,
                  items: [...p.items, { desc: "", qty: 1, price: "" }],
                }))
              }
            >
              <Icon n="plus" s={12} /> Add item
            </button>
            <div className="row">
              <button
                className="btn bp btn-full"
                onClick={handleAdd}
                disabled={!tplForm.name}
              >
                <Icon n="check" s={13} c="#fff" /> Save Template
              </button>
              <button
                className="btn bs"
                onClick={() => setShowAddTemplate(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: 16,
        }}
      >
        <button
          className="btn bp btn-sm"
          onClick={() => setShowAddTemplate(true)}
        >
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
            <button
              className="btn bd btn-sm"
              onClick={() => deleteTemplate(t.id)}
            >
              <Icon n="trash" s={12} /> Delete
            </button>
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
