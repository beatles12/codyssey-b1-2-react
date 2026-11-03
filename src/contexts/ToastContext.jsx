import { createContext, useCallback, useState } from "react";
import Toast from "../components/ui/Toast.jsx";

export const ToastContext = createContext(null);

/** 페이지를 이동해도 사라지지 않는 알림(Toast)을 앱 전체에 제공한다. */
export function ToastProvider({ children }) {
  const [toast, setToast] = useState({ message: "", type: "success" });
  const showToast = useCallback((message, type = "success") => setToast({ message, type }), []);
  const hideToast = useCallback(() => setToast(current => ({ ...current, message: "" })), []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <Toast message={toast.message} type={toast.type} onClose={hideToast} />
    </ToastContext.Provider>
  );
}
