import Icon from "../../shared/Icon";
import { currencySymbol, fmt } from "../../../utils";
import type { AppInvoice } from "../../../types";

interface MarkPaidModalProps {
  inv: AppInvoice;
  onConfirm: () => void;
  onClose: () => void;
}

export default function MarkPaidModal({
  inv,
  onConfirm,
  onClose,
}: MarkPaidModalProps) {
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-ttl">Mark as Paid</div>
        <div className="modal-sub">
          Confirm that you have received payment of{" "}
          {currencySymbol(inv.currency)}
          {fmt(inv.total)} for this invoice.
        </div>
        <div className="row">
          <button className="btn bp btn-full" onClick={onConfirm}>
            <Icon n="check" s={13} c="#fff" /> Confirm Payment Received
          </button>
          <button className="btn bs" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
