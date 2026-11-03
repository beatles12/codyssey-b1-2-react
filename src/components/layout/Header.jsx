import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import useScrolled from "../../hooks/useScrolled.js";

const NAV_ITEMS = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/projects", label: "Work" },
];

/** 로고·메뉴를 담은 상단 헤더. 모바일에서는 메뉴 열림 여부를 state로 관리한다. */
function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isScrolled = useScrolled();

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className={`site-header${isScrolled ? " scrolled" : ""}`}>
      <nav className="navigation" aria-label="주요 메뉴">
        <Link className="logo" to="/" aria-label="홈으로 이동" onClick={closeMenu}>
          S<span>.</span>
        </Link>
        <ul id="nav-menu" className={`nav-menu${isMenuOpen ? " active" : ""}`}>
          {NAV_ITEMS.map(item => (
            <li key={item.to}>
              <NavLink to={item.to} end={item.to === "/"} onClick={closeMenu}>
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
        <div className="nav-actions">
          <button
            className="menu-toggle"
            type="button"
            aria-label={isMenuOpen ? "메뉴 닫기" : "메뉴 열기"}
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
