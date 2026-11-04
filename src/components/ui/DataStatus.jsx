import LoadingState from "./LoadingState.jsx";
import ErrorState from "./ErrorState.jsx";
import EmptyState from "./EmptyState.jsx";

/**
 * 로딩 → 오류 → 빈 데이터 → 실제 내용 순서로 검사해 알맞은 화면 하나만 보여준다.
 * 모든 데이터 화면이 이 컴포넌트를 거치므로 상태 표시 방식이 하나로 통일된다.
 * @param {boolean} isLoading 요청 중인지
 * @param {string|null} error 오류 문구. 없으면 null
 * @param {boolean} [isEmpty] 데이터가 비었는지
 * @param {() => void} [onRetry] 오류 화면의 다시 시도 동작
 * @param {string} [retryLabel] 다시 시도 버튼 글자
 * @param {string} [emptyDescription] 빈 화면의 보조 설명
 */
function DataStatus({
  isLoading,
  error,
  isEmpty = false,
  onRetry,
  retryLabel,
  loadingMessage,
  emptyMessage,
  emptyDescription,
  emptyAction,
  children,
}) {
  if (isLoading) return <LoadingState message={loadingMessage} />;
  if (error) return <ErrorState message={error} onRetry={onRetry} retryLabel={retryLabel} />;
  if (isEmpty) return <EmptyState message={emptyMessage} description={emptyDescription} action={emptyAction} />;
  return children;
}

export default DataStatus;
