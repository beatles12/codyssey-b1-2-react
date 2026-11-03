import useLanguage from "../../hooks/useLanguage.js";
import useScrolled from "../../hooks/useScrolled.js";

/** 300px 이상 내려가면 나타나는 오른쪽 아래 "맨 위로" 버튼 (B1-1 계승). */
function BackToTopButton() {
  const isVisible = useScrolled(300);
  const { t } = useLanguage();

  return (
    <button
      className={`back-to-top${isVisible ? " visible" : ""}`}
      type="button"
      aria-label={t("footer.scrollTop")}
      tabIndex={isVisible ? 0 : -1}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
    >
      ↑
    </button>
  );
}

export default BackToTopButton;
