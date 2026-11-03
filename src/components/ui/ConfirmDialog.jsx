import { useEffect, useRef } from "react";
import Button from "./Button.jsx";

/**
 * 삭제처럼 되돌릴 수 없는 동작 전에 한 번 더 묻는 확인 창.
 * 열리면 창으로 포커스를 옮기고 Tab은 창 안에서만 돈다. 닫히면 원래 버튼으로 포커스를 돌려준다.
 * Esc 키나 바깥 영역 클릭은 취소로 처리한다.
 * @param {boolean} open 창을 보여줄지
 * @param {boolean} [isLoading] 확인 동작이 진행 중인지 (버튼 비활성화)
 * @param {() => void} onConfirm 확인 버튼을 눌렀을 때
 * @param {() => void} onCancel 취소했을 때
 */
function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "삭제",
  cancelLabel = "취소",
  loadingLabel = "삭제 중...",
  isLoading = false,
  onConfirm,
  onCancel,
}) {
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const previousFocus = document.activeElement;
    dialogRef.current?.focus();
    return () => previousFocus?.focus?.();
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const handleKeyDown = event => {
      if (event.key === "Escape" && !isLoading) onCancel();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, isLoading, onCancel]);

  if (!open) return null;

  const handleBackdropClick = event => {
    if (event.target === event.currentTarget && !isLoading) onCancel();
  };

  /** Tab 키가 창 밖으로 나가지 않도록 처음·마지막 버튼 사이를 돌게 한다. */
  const keepFocusInside = event => {
    if (event.key !== "Tab") return;
    const buttons = [...dialogRef.current.querySelectorAll("button:not(:disabled)")];
    if (buttons.length === 0) return;
    const first = buttons[0];
    const last = buttons[buttons.length - 1];
    if (event.shiftKey && (document.activeElement === first || document.activeElement === dialogRef.current)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <div className="dialog-backdrop" onClick={handleBackdropClick}>
      <div
        ref={dialogRef}
        className="dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        tabIndex={-1}
        onKeyDown={keepFocusInside}
      >
        <h2 id="dialog-title">{title}</h2>
        <p>{message}</p>
        <div className="dialog-actions">
          <Button onClick={onCancel} disabled={isLoading}>
            {cancelLabel}
          </Button>
          <Button variant="danger" onClick={onConfirm} isLoading={isLoading} loadingText={loadingLabel}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
