/**
 * 보여줄 데이터가 하나도 없을 때의 공통 화면.
 * @param {string} [message] 안내 문구
 * @param {React.ReactNode} [action] 문구 아래에 둘 버튼 등 (예: 첫 프로젝트 등록)
 */
function EmptyState({ message = "표시할 데이터가 없습니다.", action }) {
  return (
    <div className="state-box">
      <p>{message}</p>
      {action}
    </div>
  );
}

export default EmptyState;
