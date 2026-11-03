import { Link } from "react-router-dom";
import useAuth from "../../hooks/useAuth.js";
import useLanguage from "../../hooks/useLanguage.js";

const GITHUB_URL = "https://github.com/beatles12";

/** 저작권·GitHub 링크·관리자 로그인·맨 위로 버튼을 담은 하단 영역. */
function Footer() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer className="footer">
      <p>© 2026 Portfolio</p>
      <p>
        {t("footer.tagline")} ·{" "}
        <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
          GitHub ↗
        </a>
        {!user && (
          <>
            {" · "}
            <Link to="/login">{t("footer.admin")}</Link>
          </>
        )}
      </p>
      <button className="footer-top" type="button" onClick={scrollToTop}>
        {t("footer.backToTop")}
      </button>
    </footer>
  );
}

export default Footer;
