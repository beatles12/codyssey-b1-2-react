import { useContext } from "react";
import { ToastContext } from "../contexts/ToastContext.jsx";

/** 알림을 띄우는 함수 showToast(message, type)를 꺼내 쓴다. */
function useToast() {
  const showToast = useContext(ToastContext);
  if (!showToast) throw new Error("useToast는 ToastProvider 안에서만 사용할 수 있습니다.");
  return showToast;
}

export default useToast;
