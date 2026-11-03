import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import useLanguage from "../../hooks/useLanguage.js";
import useScrolled from "../../hooks/useScrolled.js";
import DisplayControls from "./DisplayControls.jsx";

const NAV_ITEMS = [
  { to: "/about", labelKey: "nav.about" },
  { to: "/projects", labelKey: "nav.work" },
];

/** 로고·메뉴·설정 버튼을 담은 상단 헤더. 모바일에서는 메뉴 열림 여부를 state로 관리한다. */
function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isScrolled = useScrolled(60);
  const { t } = useLanguage();

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className={`site-header${isScrolled ? " scrolled" : ""}`}>
      <nav className="navigation" aria-label={t("nav.label")}>
        <Link className="logo" to="/" aria-label={t("nav.home")} onClick={closeMenu}>
          S<span>.</span>
        </Link>
        <ul id="nav-menu" className={`nav-menu${isMenuOpen ? " active" : ""}`}>
          {NAV_ITEMS.map(item => (
            <li key={item.to}>
              <NavLink to={item.to} onClick={closeMenu}>
                {t(item.labelKey)}
              </NavLink>
            </li>
          ))}
          <li>
            <Link to="/#contact" onClick={closeMenu}>
              {t("nav.contact")}
            </Link>
          </li>
        </ul>
        <div className="nav-actions">
          <DisplayControls />
          <button
            className="menu-toggle"
            type="button"
            aria-label={t(isMenuOpen ? "nav.closeMenu" : "nav.openMenu")}
            aria-expanded={isMenuOpen}
            aria-controls="nav-menu"
            onClick={() => setIsMenuOpen(open => !open)}
          >
            <span />
            <span />
          </button>
        </div>
      </nav>
    </header>
  );
}

export default Header;
