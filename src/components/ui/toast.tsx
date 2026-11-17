"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
  title?: string;
  durationMs?: number;
}

interface ToastContextValue {
  toasts: readonly ToastMessage[];
  showToast: (toast: Omit<ToastMessage, "id">) => void;
  dismissToast: (id: string) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const typeStyles: Record<
  ToastType,
  { bg: string; border: string; text: string; iconColor: string }
> = {
  success: {
    bg: "bg-white",
    border: "border-emerald-200",
    text: "text-emerald-900",
    iconColor: "text-emerald-600",
  },
  error: {
    bg: "bg-white",
    border: "border-red-200",
    text: "text-red-900",
    iconColor: "text-red-600",
  },
  warning: {
    bg: "bg-white",
    border: "border-amber-200",
    text: "text-amber-900",
    iconColor: "text-amber-600",
  },
  info: {
    bg: "bg-white",
    border: "border-blue-200",
    text: "text-blue-900",
    iconColor: "text-blue-600",
  },
};

export function ToastProvider({ children }: { readonly children: ReactNode }) {
  const [toasts, setToasts] = useState<readonly ToastMessage[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    ({ durationMs = 4000, ...rest }: Omit<ToastMessage, "id">) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const newToast: ToastMessage = { ...rest, id, durationMs };
      setToasts((prev) => [...prev, newToast]);

      if (durationMs > 0) {
        setTimeout(() => {
          dismissToast(id);
        }, durationMs);
      }
    },
    [dismissToast]
  );

  const success = useCallback(
    (message: string, title?: string) => showToast({ type: "success", message, title }),
    [showToast]
  );
  const error = useCallback(
    (message: string, title?: string) => showToast({ type: "error", message, title }),
    [showToast]
  );
  const warning = useCallback(
    (message: string, title?: string) => showToast({ type: "warning", message, title }),
    [showToast]
  );
  const info = useCallback(
    (message: string, title?: string) => showToast({ type: "info", message, title }),
    [showToast]
  );

  return (
    <ToastContext.Provider
      value={{
        toasts,
        showToast,
        dismissToast,
        success,
        error,
        warning,
        info,
      }}
    >
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

function ToastContainer({
  toasts,
  onDismiss,
}: {
  readonly toasts: readonly ToastMessage[];
  readonly onDismiss: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-[calc(100%-2rem)] max-w-sm pointer-events-none"
    >
      {toasts.map((toast) => {
        const style = typeStyles[toast.type];
        return (
          <div
            key={toast.id}
            role={toast.type === "error" ? "alert" : "status"}
            className={`pointer-events-auto flex items-start gap-3 rounded-md border p-4 shadow-lg  ${style.bg} ${style.border}`}
          >
            <div className={`mt-0.5 shrink-0 ${style.iconColor}`}>
              {toast.type === "success" && (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
              {toast.type === "error" && (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              )}
              {toast.type === "warning" && (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              )}
              {toast.type === "info" && (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              )}
            </div>

            <div className="flex-1 min-w-0">
              {toast.title && (
                <h5 className={`text-sm font-semibold mb-0.5 ${style.text}`}>{toast.title}</h5>
              )}
              <p className="text-xs text-slate-600 leading-normal">{toast.message}</p>
            </div>

            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              className="text-slate-400 hover:text-slate-600 p-0.5 rounded-md hover:bg-slate-100 transition-colors"
              aria-label="Đóng thông báo"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        );
      })}
    </div>
  );
}
