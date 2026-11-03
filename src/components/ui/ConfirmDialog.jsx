import { useEffect, useRef } from "react";
import Button from "./Button.jsx";

/**
 * 삭제처럼 되돌릴 수 없는 동작 전에 한 번 더 묻는 확인 창.
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
  isLoading = false,
  onConfirm,
  onCancel,
}) {
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = event => {
      if (event.key === "Escape" && !isLoading) onCancel();
    };

    dialogRef.current?.focus();
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, isLoading, onCancel]);

  if (!open) return null;

  const handleBackdropClick = event => {
    if (event.target === event.currentTarget && !isLoading) onCancel();
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
      >
        <h2 id="dialog-title">{title}</h2>
        <p>{message}</p>
        <div className="dialog-actions">
          <Button onClick={onCancel} disabled={isLoading}>
            취소
          </Button>
          <Button
            variant="danger"
            onClick={onConfirm}
            isLoading={isLoading}
            loadingText="삭제 중..."
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
