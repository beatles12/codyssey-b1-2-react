import Button from "./Button.jsx";

/**
 * 요청 실패 시 보여주는 공통 오류 화면.
 * @param {string} [message] 오류 안내 문구
 * @param {() => void} [onRetry] 있으면 "다시 시도" 버튼을 보여주고 누를 때 호출
 */
function ErrorState({ message = "요청에 실패했습니다. 다시 시도하세요.", onRetry }) {
  return (
    <div className="state-box state-error" role="alert">
      <p>{message}</p>
      {onRetry && <Button onClick={onRetry}>다시 시도</Button>}
    </div>
  );
}

export default ErrorState;
