import Button from "./Button.jsx";

/**
 * 요청 실패 시 보여주는 공통 오류 화면.
 * @param {string} [message] 오류 안내 문구
 * @param {() => void} [onRetry] 있으면 다시 시도 버튼을 보여주고 누를 때 호출
 * @param {string} [retryLabel] 다시 시도 버튼 글자 (언어별로 전달)
 */
function ErrorState({ message = "요청에 실패했습니다. 다시 시도하세요.", onRetry, retryLabel = "다시 시도" }) {
  return (
    <div className="state-box state-error" role="alert">
      <p>{message}</p>
      {onRetry && <Button onClick={onRetry}>{retryLabel}</Button>}
    </div>
  );
}

export default ErrorState;
