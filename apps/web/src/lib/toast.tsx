import React, { createContext, useContext, useState, useCallback } from "react";
import { ROBINHOOD_TESTNET, ROBINHOOD_MAINNET } from "@orven/product-config";

export interface ToastItem {
  id: string;
  type: "pending" | "success" | "error" | "info";
  title: string;
  message?: string;
  txHash?: string;
  chainId?: number;
  duration?: number;
}

interface ToastContextValue {
  toasts: ToastItem[];
  showToast: (toast: Omit<ToastItem, "id">) => string;
  updateToast: (id: string, update: Partial<Omit<ToastItem, "id">>) => void;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue>({
  toasts: [],
  showToast: () => "",
  updateToast: () => {},
  dismissToast: () => {},
});

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const updateToast = useCallback(
    (id: string, update: Partial<Omit<ToastItem, "id">>) => {
      setToasts((prev) =>
        prev.map((t) => {
          if (t.id === id) {
            const updated = { ...t, ...update };
            // If updated to success or error, auto-dismiss after duration
            if (update.type === "success" || update.type === "error" || update.type === "info") {
              const dur = update.duration ?? 6000;
              setTimeout(() => {
                dismissToast(id);
              }, dur);
            }
            return updated;
          }
          return t;
        })
      );
    },
    [dismissToast]
  );

  const showToast = useCallback(
    (newToast: Omit<ToastItem, "id">) => {
      const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      const toast: ToastItem = { ...newToast, id };

      setToasts((prev) => [toast, ...prev.slice(0, 3)]); // Keep max 4 toasts

      if (toast.type !== "pending") {
        const dur = toast.duration ?? 6000;
        setTimeout(() => {
          dismissToast(id);
        }, dur);
      }

      return id;
    },
    [dismissToast]
  );

  return (
    <ToastContext.Provider value={{ toasts, showToast, updateToast, dismissToast }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  return {
    showToast: context.showToast,
    updateToast: context.updateToast,
    dismissToast: context.dismissToast,
    toast: {
      pending: (title: string, message?: string) =>
        context.showToast({ type: "pending", title, message }),
      success: (title: string, message?: string, txHash?: string, chainId?: number) =>
        context.showToast({ type: "success", title, message, txHash, chainId }),
      error: (title: string, message?: string) =>
        context.showToast({ type: "error", title, message }),
      info: (title: string, message?: string) =>
        context.showToast({ type: "info", title, message }),
    },
  };
}

function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div className="toast-viewport" aria-live="polite" aria-atomic="true">
      {toasts.map((t) => {
        const explorerBase =
          t.chainId === ROBINHOOD_MAINNET.id
            ? ROBINHOOD_MAINNET.explorerUrl
            : ROBINHOOD_TESTNET.explorerUrl;

        return (
          <div key={t.id} className={`toast-card toast-${t.type}`} role="alert">
            <div className="toast-icon-wrap">
              {t.type === "pending" && <span className="toast-spinner" />}
              {t.type === "success" && (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
              {t.type === "error" && (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              )}
              {t.type === "info" && (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
              )}
            </div>

            <div className="toast-content">
              <div className="toast-title">{t.title}</div>
              {t.message && <div className="toast-message">{t.message}</div>}
              {t.txHash && (
                <a
                  href={`${explorerBase}/tx/${t.txHash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="toast-tx-link mono"
                >
                  View on Blockscout ({t.txHash.slice(0, 8)}...) ↗
                </a>
              )}
            </div>

            <button
              type="button"
              className="toast-dismiss-btn"
              onClick={() => onDismiss(t.id)}
              aria-label="Dismiss notification"
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );
}
