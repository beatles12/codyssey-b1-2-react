import { useEffect } from "react";

/**
 * 저장·삭제 결과를 잠깐 띄우는 알림. message가 있을 때만 보이고 duration 뒤 onClose를 부른다.
 * onClose는 렌더링마다 새로 만들지 않도록 부모에서 useCallback으로 감싸는 것이 좋다.
 * @param {string} message 알림 문구. 빈 문자열이면 숨김
 * @param {"success"|"error"} [type] 성공/실패 색상
 * @param {() => void} onClose 닫을 때 호출 (부모가 message를 비운다)
 * @param {number} [duration] 자동으로 닫히기까지 걸리는 시간(ms)
 */
function Toast({ message, type = "success", onClose, duration = 3000 }) {
  useEffect(() => {
    if (!message) return undefined;

    const timerId = setTimeout(onClose, duration);
    return () => clearTimeout(timerId);
  }, [message, duration, onClose]);

  if (!message) return null;

  return (
    <div className={`toast toast-${type}`} role={type === "error" ? "alert" : "status"}>
      <p>{message}</p>
      <button type="button" aria-label="알림 닫기" onClick={onClose}>
        ×
      </button>
    </div>
  );
}

export default Toast;
