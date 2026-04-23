"use client";

import { ReactNode, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

type Variant = "success" | "error" | "info";

interface AdminMessageProps {
  open: boolean;
  onClose?: () => void;
  variant?: Variant;
  children: ReactNode;
  autoHideMs?: number;
}

const variantStyles: Record<Variant, { container: string; icon: string }> = {
  success: {
    container: "bg-green-50 text-green-800 border-green-200",
    icon: "text-green-500",
  },
  error: {
    container: "bg-red-50 text-red-800 border-red-200",
    icon: "text-red-500",
  },
  info: {
    container: "bg-blue-50 text-blue-800 border-blue-200",
    icon: "text-blue-500",
  },
};

export default function AdminMessage({
  open,
  onClose,
  variant = "info",
  children,
  autoHideMs = 4000,
}: AdminMessageProps) {
  useEffect(() => {
    if (!open || !onClose || !autoHideMs) return;
    const id = setTimeout(onClose, autoHideMs);
    return () => clearTimeout(id);
  }, [open, onClose, autoHideMs]);

  const styles = variantStyles[variant];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.98 }}
          transition={{ duration: 0.2 }}
          className={`flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg shadow-black/5 backdrop-blur-sm ${styles.container}`}
        >
          <div className={`mt-0.5 ${styles.icon}`}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                d={
                  variant === "success"
                    ? "M5 13l4 4L19 7M12 21a9 9 0 100-18 9 9 0 000 18z"
                    : variant === "error"
                    ? "M15 9l-6 6m0-6l6 6M12 21a9 9 0 100-18 9 9 0 000 18z"
                    : "M12 9v4m0 4h.01M12 21a9 9 0 100-18 9 9 0 000 18z"
                }
              />
            </svg>
          </div>
          <div className="flex-1 text-sm font-medium leading-snug">{children}</div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="ml-2 rounded-full p-1 text-xs text-inherit/70 transition hover:bg-black/5 hover:text-inherit"
              aria-label="Dismiss message"
            >
              ✕
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

