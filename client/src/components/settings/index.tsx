"use client";
import { useState } from "react";
import { useApp } from "../../context/AppContext";
import { userApi } from "../../api/user.api";
import ProfileTab from "./ProfileTab";
import TemplatesTab from "./TemplatesTab";
import NotificationsTab from "./NotificationsTab";
import BillingTab from "./BillingTab";

const TABS = [
  ["profile", "Profile"],
  ["templates", "Templates"],
  ["notifications", "Notifications"],
  ["billing", "Billing"],
] as const;

type TabKey = (typeof TABS)[number][0];

export default function SettingsPage() {
  const { user, setUser, showToast } = useApp();
  const [activeTab, setActiveTab] = useState<TabKey>("profile");
  const [profile, setProfile] = useState({
    name: user?.name ?? "",
    business: user?.businessName ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
    address: user?.address ?? "",
    logo: user?.logoUrl ?? "",
    defaultCurrency: user?.defaultCurrency ?? "USD",
    homeCurrency: user?.homeCurrency ?? "",
  });

  async function handleSave() {
    try {
      const updated = await userApi.updateProfile({
        name: profile.name,
        businessName: profile.business,
        phone: profile.phone,
        address: profile.address,
        logoUrl: profile.logo,
        defaultCurrency: profile.defaultCurrency,
        homeCurrency: profile.homeCurrency || undefined,
      });
      setUser(updated);
      showToast("Profile saved");
    } catch {
      showToast("Failed to save profile");
    }
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
        {TABS.map(([k, l]) => (
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
        <ProfileTab
          profile={profile}
          onChange={(patch) => setProfile((p) => ({ ...p, ...patch }))}
          onSave={handleSave}
        />
      )}
      {activeTab === "templates" && <TemplatesTab />}
      {activeTab === "notifications" && <NotificationsTab />}
      {activeTab === "billing" && <BillingTab onToast={showToast} />}
    </div>
  );
}
