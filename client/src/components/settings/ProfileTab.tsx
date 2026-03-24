import { useState } from "react";
import Icon from "../shared/Icon";
import { CURRENCIES, CURRENCY_NAMES } from "../../constants";

interface ProfileState {
  name: string;
  business: string;
  email: string;
  phone: string;
  address: string;
  logo: string;
  defaultCurrency: string;
  homeCurrency: string;
}

interface ProfileTabProps {
  profile: ProfileState;
  onChange: (patch: Partial<ProfileState>) => void;
  onSave: () => Promise<void>;
}

export default function ProfileTab({
  profile,
  onChange,
  onSave,
}: ProfileTabProps) {
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      await onSave();
    } finally {
      setSaving(false);
    }
  }

  return (
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
                onChange={(e) => onChange({ name: e.target.value })}
              />
            </div>
            <div className="fg">
              <label>Business / Studio</label>
              <input
                value={profile.business}
                onChange={(e) => onChange({ business: e.target.value })}
              />
            </div>
            <div className="fg full">
              <label>Email</label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => onChange({ email: e.target.value })}
              />
            </div>
            <div className="fg full">
              <label>Address (shown on invoices)</label>
              <textarea
                rows={2}
                value={profile.address}
                onChange={(e) => onChange({ address: e.target.value })}
                style={{ resize: "none" }}
                placeholder="Your full address"
              />
            </div>
          </div>
          <button className="btn bp mt3" onClick={save} disabled={saving}>
            {saving ? (
              <Icon n="spin" s={13} c="#fff" />
            ) : (
              <Icon n="check" s={13} c="#fff" />
            )}
            {saving ? " Saving…" : " Save Profile"}
          </button>
        </div>

        <div className="card">
          <div className="card-ttl">Invoice Defaults</div>
          <div className="fgrid">
            <div className="fg">
              <label>Invoice currency (default)</label>
              <select
                value={profile.defaultCurrency}
                onChange={(e) => onChange({ defaultCurrency: e.target.value })}
              >
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>
                    {c} — {CURRENCY_NAMES[c]}
                  </option>
                ))}
              </select>
            </div>
            <div className="fg">
              <label>Home currency (for received amounts)</label>
              <select
                value={profile.homeCurrency}
                onChange={(e) => onChange({ homeCurrency: e.target.value })}
              >
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>
                    {c} — {CURRENCY_NAMES[c]}
                  </option>
                ))}
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
          <button className="btn bp mt3" onClick={save} disabled={saving}>
            {saving ? (
              <Icon n="spin" s={13} c="#fff" />
            ) : (
              <Icon n="check" s={13} c="#fff" />
            )}
            {saving ? " Saving…" : " Save Defaults"}
          </button>
        </div>
      </div>

      {/* Profile preview sidebar */}
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
          <div className="av" style={{ width: 44, height: 44, fontSize: 14 }}>
            LE
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: "var(--tx)" }}>
              {profile.name}
            </div>
            <div style={{ fontSize: 12, color: "var(--tx3)" }}>
              {profile.business}
            </div>
          </div>
        </div>
        <div style={{ fontSize: 12, color: "var(--tx3)" }}>{profile.email}</div>
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
  );
}
