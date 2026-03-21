import { useState } from "react";
import Icon from "./Icon";

// ToggleRow extracted to avoid calling useState inside .map() (hooks-in-loop violation)
interface ToggleRowProps {
  label: string;
  sub: string;
  defaultOn: boolean;
}
function ToggleRow({ label, sub, defaultOn }: ToggleRowProps) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        padding: "12px 0",
        borderBottom: "1px solid var(--bd)",
      }}
    >
      <div>
        <div style={{ fontSize: 13, fontWeight: 500, color: "var(--tx)" }}>
          {label}
        </div>
        <div style={{ fontSize: 11, color: "var(--tx3)", marginTop: 2 }}>
          {sub}
        </div>
      </div>
      <div
        style={{
          position: "relative",
          width: 36,
          height: 20,
          background: on ? "var(--g)" : "var(--bd2)",
          borderRadius: 10,
          cursor: "pointer",
          transition: "background .15s",
          flexShrink: 0,
          marginLeft: 12,
        }}
        onClick={() => setOn((p) => !p)}
      >
        <div
          style={{
            position: "absolute",
            top: 2,
            left: on ? 16 : 2,
            width: 16,
            height: 16,
            borderRadius: "50%",
            background: "#fff",
            transition: "left .15s",
          }}
        />
      </div>
    </div>
  );
}

const NOTIFICATION_ROWS = [
  {
    label: "Invoice viewed by client",
    sub: "Get notified when your client opens the invoice link",
    def: true,
  },
  {
    label: "Invoice downloaded",
    sub: "Get notified when your client downloads the PDF",
    def: true,
  },
  {
    label: "Invoice paid",
    sub: "Get notified when you mark an invoice as paid",
    def: true,
  },
  {
    label: "Overdue reminders",
    sub: "Automatically send your client reminders on day 1, 7, and 14 after due date",
    def: false,
  },
  {
    label: "Weekly summary",
    sub: "Receive a weekly summary of your invoice activity",
    def: false,
  },
];

interface SettingsPageProps {
  templates: any[];
  setTemplates: (fn: any) => void;
  toast: (msg: string) => void;
}

export default function SettingsPage({
  templates,
  setTemplates,
  toast,
}: SettingsPageProps) {
  const [profile, setProfile] = useState({
    name: "Lucky Eze",
    business: "DevCraft Studio",
    email: "lucky@devcraft.ng",
    phone: "",
    address: "",
    logo: "",
  });
  const [showAddTemplate, setShowAddTemplate] = useState(false);
  const [tplForm, setTplForm] = useState({
    name: "",
    items: [{ desc: "", qty: 1, price: "" }],
  });
  const [activeTab, setActiveTab] = useState("profile");

  function saveProfile() {
    toast("Profile saved");
  }

  function addTemplate() {
    if (!tplForm.name) return;
    setTemplates((p: any[]) => [...p, { id: "t" + Date.now(), ...tplForm }]);
    setTplForm({ name: "", items: [{ desc: "", qty: 1, price: "" }] });
    setShowAddTemplate(false);
    toast("Template saved");
  }

  return (
    <div className="pg fade">
      <div className="pg-hd">
        <div>
          <div className="pg-ttl">Settings</div>
          <div className="pg-sub">Manage your account and preferences</div>
        </div>
      </div>
      <div className="tabs">
        {[
          ["profile", "Profile"],
          ["templates", "Templates"],
          ["notifications", "Notifications"],
          ["billing", "Billing"],
        ].map(([k, l]) => (
          <button
            key={k}
            className={`tab ${activeTab === k ? "on" : ""}`}
            onClick={() => setActiveTab(k)}
          >
            {l}
          </button>
        ))}
      </div>

      {activeTab === "profile" && (
        <div
          className="two-col"
          style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 18 }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="card">
              <div className="card-ttl">Personal Details</div>
              <div className="fgrid">
                <div className="fg">
                  <label>Full name</label>
                  <input
                    value={profile.name}
                    onChange={(e) =>
                      setProfile((p) => ({ ...p, name: e.target.value }))
                    }
                  />
                </div>
                <div className="fg">
                  <label>Business / Studio</label>
                  <input
                    value={profile.business}
                    onChange={(e) =>
                      setProfile((p) => ({ ...p, business: e.target.value }))
                    }
                  />
                </div>
                <div className="fg full">
                  <label>Email</label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) =>
                      setProfile((p) => ({ ...p, email: e.target.value }))
                    }
                  />
                </div>
                <div className="fg full">
                  <label>Address (shown on invoices)</label>
                  <textarea
                    rows={2}
                    value={profile.address}
                    onChange={(e) =>
                      setProfile((p) => ({ ...p, address: e.target.value }))
                    }
                    style={{ resize: "none" }}
                    placeholder="Your full address"
                  />
                </div>
              </div>
              <button className="btn bp mt3" onClick={saveProfile}>
                <Icon n="check" s={13} c="#fff" /> Save Profile
              </button>
            </div>
            <div className="card">
              <div className="card-ttl">Invoice Defaults</div>
              <div className="fgrid">
                <div className="fg">
                  <label>Default currency</label>
                  <select>
                    <option>USD</option>
                    <option>GBP</option>
                    <option>EUR</option>
                  </select>
                </div>
                <div className="fg">
                  <label>Default payment terms</label>
                  <select>
                    <option>Net 14</option>
                    <option>Net 30</option>
                    <option>Due on receipt</option>
                  </select>
                </div>
                <div className="fg full">
                  <label>Default invoice notes</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Thank you for your business!"
                    style={{ resize: "none" }}
                  />
                </div>
              </div>
              <button className="btn bp mt3" onClick={saveProfile}>
                <Icon n="check" s={13} c="#fff" /> Save Defaults
              </button>
            </div>
          </div>
          <div className="card" style={{ height: "fit-content" }}>
            <div className="card-ttl">Profile Preview</div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 12,
              }}
            >
              <div
                className="av"
                style={{ width: 44, height: 44, fontSize: 14 }}
              >
                LE
              </div>
              <div>
                <div
                  style={{ fontWeight: 700, fontSize: 14, color: "var(--tx)" }}
                >
                  {profile.name}
                </div>
                <div style={{ fontSize: 12, color: "var(--tx3)" }}>
                  {profile.business}
                </div>
              </div>
            </div>
            <div style={{ fontSize: 12, color: "var(--tx3)" }}>
              {profile.email}
            </div>
            {profile.address && (
              <div
                style={{
                  fontSize: 12,
                  color: "var(--tx3)",
                  marginTop: 4,
                  lineHeight: 1.5,
                }}
              >
                {profile.address}
              </div>
            )}
            <div
              style={{
                marginTop: 12,
                padding: "8px 12px",
                background: "var(--glt)",
                borderRadius: 8,
                fontSize: 11,
                color: "var(--gdk)",
              }}
            >
              This is how your name appears on invoices
            </div>
          </div>
        </div>
      )}

      {activeTab === "templates" && (
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
                              i === idx
                                ? { ...x, qty: Number(e.target.value) }
                                : x
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
                    onClick={addTemplate}
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
            {templates.map((t: any) => (
              <div
                key={t.id}
                className="card"
                style={{ display: "flex", alignItems: "center", gap: 14 }}
              >
                <div
                  className="af-icon b-gray"
                  style={{ width: 36, height: 36 }}
                >
                  <Icon n="template" s={16} />
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: 14,
                      color: "var(--tx)",
                    }}
                  >
                    {t.name}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--tx3)" }}>
                    {t.items.length} line items:{" "}
                    {t.items
                      .map((i: any) => i.desc)
                      .filter(Boolean)
                      .join(", ")}
                  </div>
                </div>
                <button
                  className="btn bd btn-sm"
                  onClick={() =>
                    setTemplates((p: any[]) => p.filter((x) => x.id !== t.id))
                  }
                >
                  <Icon n="trash" s={12} /> Delete
                </button>
              </div>
            ))}
            {templates.length === 0 && (
              <div className="empty">
                <Icon n="template" s={40} c="var(--tx3)" />
                <p>
                  No templates yet. Create one to speed up invoice creation.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "notifications" && (
        <div className="card" style={{ maxWidth: 520 }}>
          <div className="card-ttl">Email Notifications</div>
          {NOTIFICATION_ROWS.map((row) => (
            <ToggleRow
              key={row.label}
              label={row.label}
              sub={row.sub}
              defaultOn={row.def}
            />
          ))}
        </div>
      )}

      {activeTab === "billing" && (
        <div className="card" style={{ maxWidth: 460 }}>
          <div className="card-ttl">Current Plan</div>
          <div
            style={{
              background: "linear-gradient(135deg,var(--glt),#f0fdf4)",
              border: "1.5px solid var(--gmid)",
              borderRadius: "var(--r)",
              padding: "16px 18px",
              marginBottom: 16,
            }}
          >
            <div style={{ fontWeight: 700, fontSize: 16, color: "var(--gdk)" }}>
              Free Plan
            </div>
            <div style={{ fontSize: 12, color: "var(--tx3)", marginTop: 3 }}>
              10 invoices/month {"\u00b7"} Basic features
            </div>
          </div>
          <div
            style={{
              fontSize: 13,
              color: "var(--tx2)",
              marginBottom: 16,
              lineHeight: 1.6,
            }}
          >
            Upgrade to Pro for unlimited invoices, recurring invoices, automatic
            reminders, and team access.
          </div>
          <button className="btn bp" onClick={() => toast("Coming soon!")}>
            <Icon n="star" s={13} c="#fff" /> Upgrade to Pro
          </button>
        </div>
      )}
    </div>
  );
}
