import { useEffect, useState } from "react";
import { useAppStore } from "../../lib/store";

export function Toast() {
  const message = useAppStore((s) => s.toastMessage);
  const token = useAppStore((s) => s.toastToken);
  const clearToast = useAppStore((s) => s.clearToast);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!message) return;
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 3200);
    const t2 = setTimeout(clearToast, 3500);
    return () => {
      clearTimeout(t);
      clearTimeout(t2);
    };
  }, [token]);

  if (!message) return null;

  return (
    <div
      className={`fixed left-1/2 -translate-x-1/2 z-[250] bg-[#1c2a1e] border border-lime/28 rounded-2xl px-4.5 py-3 text-[#eaf6e8] text-sm max-w-[calc(100vw-32px)] shadow-[0_12px_40px_#0008] transition-opacity duration-200 max-sm:text-center max-sm:text-xs ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      style={{ bottom: "24px" }}
    >
      {message}
    </div>
  );
}
