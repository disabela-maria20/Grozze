'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/shared/store';

/** Toast starts fading out at this point... */
const FADE_OUT_AT_MS = 3200;
/** ...and is removed from the store once the fade has finished. */
const CLEAR_AT_MS = 3500;

export function Toast() {
  const message = useAppStore((s) => s.toastMessage);
  const token = useAppStore((s) => s.toastToken);
  const clearToast = useAppStore((s) => s.clearToast);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!message) return;
    const showFrame = requestAnimationFrame(() => setVisible(true));
    const hideTimer = setTimeout(() => setVisible(false), FADE_OUT_AT_MS);
    const clearTimer = setTimeout(clearToast, CLEAR_AT_MS);
    return () => {
      cancelAnimationFrame(showFrame);
      clearTimeout(hideTimer);
      clearTimeout(clearTimer);
    };
  }, [token, message, clearToast]);

  if (!message) return null;

  return (
    <div
      className={`fixed left-1/2 -translate-x-1/2 z-[250] bg-[#1c2a1e] border border-lime/28 rounded-2xl px-4.5 py-3 text-[#eaf6e8] text-sm max-w-[calc(100vw-32px)] shadow-[0_12px_40px_#0008] transition-opacity duration-200 max-sm:text-center max-sm:text-xs ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{ bottom: '24px' }}
    >
      {message}
    </div>
  );
}
