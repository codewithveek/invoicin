"use client";
import Icon from "../../shared/Icon";
import type { AppClient, AppTemplate } from "../../../types";

interface ClientPickerModalProps {
  clients: AppClient[];
  onSelect: (client: AppClient) => void;
  onClose: () => void;
}

export function ClientPickerModal({
  clients,
  onSelect,
  onClose,
}: ClientPickerModalProps) {
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-ttl">Select Client</div>
        <div className="modal-sub">Choose from your address book</div>
        {clients.map((c) => (
          <div key={c.id} className="client-item" onClick={() => onSelect(c)}>
            <div className="av w-8 h-8 text-[11px]">{c.name.charAt(0)}</div>
            <div>
              <div className="font-semibold text-[13px] text-tx">{c.name}</div>
              <div className="text-[12px] text-tx3">{c.email}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface TemplatePickerModalProps {
  templates: AppTemplate[];
  onSelect: (template: AppTemplate) => void;
  onClose: () => void;
}

export function TemplatePickerModal({
  templates,
  onSelect,
  onClose,
}: TemplatePickerModalProps) {
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-ttl">Invoice Templates</div>
        <div className="modal-sub">Start with a pre-filled line item set</div>
        {templates.map((t) => (
          <div key={t.id} className="client-item" onClick={() => onSelect(t)}>
            <div className="af-icon b-gray w-8 h-8">
              <Icon n="template" s={14} />
            </div>
            <div>
              <div className="font-semibold text-[13px] text-tx">{t.name}</div>
              <div className="text-[12px] text-tx3">
                {t.items.length} line items
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
