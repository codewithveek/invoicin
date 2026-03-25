"use client";
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
    <div className="fixed bottom-6 right-6 z-[9999] bg-tx text-white px-[18px] py-[11px] rounded-[10px] text-[13px] font-medium flex items-center gap-2 shadow-[0_8px_24px_rgba(0,0,0,.2)] animate-[fi_.2s_ease]">
      <Icon n="check" s={15} c="#4ade80" />
      {msg}
    </div>
  );
}
