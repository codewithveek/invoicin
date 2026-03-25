"use client";
import Icon from "../../shared/Icon";

interface ShareModalProps {
  shareUrl: string;
  copied: boolean;
  onCopy: () => void;
  onClose: () => void;
  onToast: (msg: string) => void;
}

export default function ShareModal({
  shareUrl,
  copied,
  onCopy,
  onClose,
  onToast,
}: ShareModalProps) {
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-ttl">Share Invoice Link</div>
        <div className="modal-sub">
          Anyone with this link can view the invoice. When they open it, you
          will be notified.
        </div>
        <div className="lbox mb4">
          <span className="lurl">{shareUrl}</span>
          <button className="btn bg btn-sm" onClick={onCopy}>
            {copied ? (
              <>
                <Icon n="check" s={12} c="var(--g)" /> Copied
              </>
            ) : (
              <>
                <Icon n="copy" s={12} /> Copy
              </>
            )}
          </button>
        </div>
        <div className="row">
          <button
            className="btn bs btn-full"
            onClick={() => {
              onToast("Opening WhatsApp...");
              onClose();
            }}
          >
            <Icon n="whatsapp" s={13} /> Share via WhatsApp
          </button>
          <button
            className="btn bs btn-full"
            onClick={() => {
              onToast("Opening email client...");
              onClose();
            }}
          >
            <Icon n="mail" s={13} /> Open in Email
          </button>
        </div>
      </div>
    </div>
  );
}
