import { useEffect } from "react";
import Icon from "./Icon";

interface ToastProps {
  msg: string;
  onClose: () => void;
}

export default function Toast({ msg, onClose }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 9999,
        background: "var(--tx)",
        color: "#fff",
        padding: "11px 18px",
        borderRadius: 10,
        fontSize: 13,
        fontWeight: 500,
        display: "flex",
        alignItems: "center",
        gap: 8,
        boxShadow: "0 8px 24px rgba(0,0,0,.2)",
        animation: "fi .2s ease",
      }}
    >
      <Icon n="check" s={15} c="#4ade80" />
      {msg}
    </div>
  );
}
