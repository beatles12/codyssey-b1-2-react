/**
 * 보여줄 데이터가 하나도 없을 때의 공통 화면. 라벤더 일러스트와 안내 문구, 다음 행동 버튼을 보여준다.
 * @param {string} [message] 안내 문구 (굵게)
 * @param {string} [description] 아래에 덧붙이는 설명
 * @param {React.ReactNode} [action] 문구 아래에 둘 버튼 등 (예: 첫 프로젝트 등록)
 */
function EmptyState({ message = "표시할 데이터가 없습니다.", description, action }) {
  return (
    <div className="state-box state-empty">
      <svg className="empty-mark" viewBox="0 0 64 64" aria-hidden="true">
        <rect x="10" y="18" width="44" height="34" rx="8" />
        <path d="M10 26h44M22 18v-4a4 4 0 0 1 4-4h12a4 4 0 0 1 4 4v4" />
        <circle cx="48" cy="12" r="3" />
        <path d="M54 22l3-3M57 30h4" />
      </svg>
      <p className="empty-title">{message}</p>
      {description && <p className="empty-description">{description}</p>}
      {action && <div className="empty-action">{action}</div>}
    </div>
  );
}

export default EmptyState;
