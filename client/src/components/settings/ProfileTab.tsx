"use client";
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
    <div className="two-col grid grid-cols-[1fr_280px] gap-[18px]">
      <div className="flex flex-col gap-4">
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
                className="resize-none"
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
                className="resize-none"
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

      <div className="card h-fit">
        <div className="card-ttl">Profile Preview</div>
        <div className="flex items-center gap-[10px] mb-3">
          <div className="av w-11 h-11 text-[14px]">LE</div>
          <div>
            <div className="font-bold text-[14px] text-tx">{profile.name}</div>
            <div className="text-[12px] text-tx3">{profile.business}</div>
          </div>
        </div>
        <div className="text-[12px] text-tx3">{profile.email}</div>
        {profile.address && (
          <div className="text-[12px] text-tx3 mt-1 leading-relaxed">
            {profile.address}
          </div>
        )}
        <div className="mt-3 px-3 py-2 bg-brand-light rounded-lg text-[11px] text-brand-dark">
          This is how your name appears on invoices
        </div>
      </div>
    </div>
  );
}
