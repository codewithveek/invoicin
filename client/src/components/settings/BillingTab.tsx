"use client";
import Icon from "../shared/Icon";

interface BillingTabProps {
  onToast: (msg: string) => void;
}

export default function BillingTab({ onToast }: BillingTabProps) {
  return (
    <div className="card max-w-[460px]">
      <div className="card-ttl">Current Plan</div>
      <div className="bg-gradient-to-br from-brand-light to-[#f0fdf4] border-[1.5px] border-brand-mid rounded-[var(--radius-md)] px-[18px] py-4 mb-4">
        <div className="font-bold text-[16px] text-brand-dark">Free Plan</div>
        <div className="text-[12px] text-tx3 mt-[3px]">
          10 invoices/month · Basic features
        </div>
      </div>
      <div className="text-[13px] text-tx2 mb-4 leading-relaxed">
        Upgrade to Pro for unlimited invoices, recurring invoices, automatic
        reminders, and team access.
      </div>
      <button className="btn bp" onClick={() => onToast("Coming soon!")}>
        <Icon n="star" s={13} c="#fff" /> Upgrade to Pro
      </button>
    </div>
  );
}
