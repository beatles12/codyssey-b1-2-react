/**
 * 데이터를 기다리는 동안 보여주는 공통 로딩 화면.
 * @param {string} [message] 스피너 옆 안내 문구
 */
function LoadingState({ message = "불러오는 중입니다." }) {
  return (
    <div className="state-box" role="status">
      <span className="spinner" aria-hidden="true" />
      <p>{message}</p>
    </div>
  );
}

export default LoadingState;
