import { useState } from "react";
import { useTemplateMutations } from "../../hooks/useTemplates";
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
  const { showToast } = useTemplateMutations();
  const [activeTab, setActiveTab] = useState<TabKey>("profile");
  const [profile, setProfile] = useState({
    name: "Lucky Eze",
    business: "DevCraft Studio",
    email: "lucky@devcraft.ng",
    phone: "",
    address: "",
    logo: "",
    defaultCurrency: "USD",
    homeCurrency: "NGN",
  });

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
          onSave={() => showToast("Profile saved")}
        />
      )}
      {activeTab === "templates" && <TemplatesTab />}
      {activeTab === "notifications" && <NotificationsTab />}
      {activeTab === "billing" && <BillingTab onToast={showToast} />}
    </div>
  );
}
