import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth.js";
import useLanguage from "../../hooks/useLanguage.js";
import useScrolled from "../../hooks/useScrolled.js";
import useToast from "../../hooks/useToast.js";
import DisplayControls from "./DisplayControls.jsx";

// B1-1과 같은 메뉴 순서. isSection은 홈 안의 섹션(#)으로 이동하는 링크.
const NAV_ITEMS = [
  { to: "/about", labelKey: "nav.about" },
  { to: "/#expertise", labelKey: "nav.expertise", isSection: true },
  { to: "/projects", labelKey: "nav.work" },
  { to: "/#contact", labelKey: "nav.contact", isSection: true },
];

/** 로고·메뉴·설정 버튼을 담은 상단 헤더. 로그인하면 Logout, 관리자면 New 메뉴가 생긴다. */
function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isScrolled = useScrolled(60);
  const { t } = useLanguage();
  const { user, isAdmin, signOut } = useAuth();
  const showToast = useToast();
  const navigate = useNavigate();

  const closeMenu = () => setIsMenuOpen(false);

  const handleLogout = async () => {
    closeMenu();
    try {
      await signOut();
      showToast(t("auth.loggedOut"));
      navigate("/projects");
    } catch {
      showToast(t("errors.unknown"), "error");
    }
  };

  return (
    <header className={`site-header${isScrolled ? " scrolled" : ""}`}>
      <nav className="navigation" aria-label={t("nav.label")}>
        <Link className="logo" to="/" aria-label={t("nav.home")} onClick={closeMenu}>
          S<span>.</span>
        </Link>
        <ul id="nav-menu" className={`nav-menu${isMenuOpen ? " active" : ""}`}>
          {NAV_ITEMS.map(item => {
            const MenuLink = item.isSection ? Link : NavLink;
            return (
              <li key={item.to}>
                <MenuLink to={item.to} onClick={closeMenu}>
                  {t(item.labelKey)}
                </MenuLink>
              </li>
            );
          })}
          {isAdmin && (
            <li>
              <NavLink to="/projects/new" onClick={closeMenu}>
                {t("nav.newProject")}
              </NavLink>
            </li>
          )}
          {user && (
            <li>
              <button className="nav-button" type="button" onClick={handleLogout}>
                {t("nav.logout")}
              </button>
            </li>
          )}
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
