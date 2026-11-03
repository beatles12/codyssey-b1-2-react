import { Link } from "react-router-dom";

/**
 * 공통 버튼. `to`가 있으면 페이지 이동 링크로, 없으면 <button>으로 그린다.
 * @param {"primary"|"secondary"|"danger"} [variant] 모양 (채움 / 테두리 / 위험)
 * @param {string} [to] 이동할 경로
 * @param {string} [icon] 글자 오른쪽에 붙는 기호 (예: "→")
 * @param {boolean} [isLoading] true면 비활성화하고 loadingText를 보여준다
 */
function Button({
  children,
  variant = "secondary",
  to,
  icon,
  type = "button",
  isLoading = false,
  loadingText = "처리 중...",
  disabled = false,
  onClick,
}) {
  const className = `button button-${variant}`;
  const content = (
    <>
      {isLoading ? loadingText : children}
      {icon && !isLoading && <span aria-hidden="true">{icon}</span>}
    </>
  );

  if (to) {
    return (
      <Link className={className} to={to}>
        {content}
      </Link>
    );
  }

  return (
    <button
      className={className}
      type={type}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      onClick={onClick}
    >
      {content}
    </button>
  );
}

export default Button;
