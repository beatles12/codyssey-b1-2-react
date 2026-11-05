import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import BackToTopButton from "./BackToTopButton.jsx";
import Header from "./Header.jsx";
import Footer from "./Footer.jsx";

/** 모든 페이지 공통 틀(헤더·본문·푸터). 주소가 바뀌면 맨 위나 #섹션 위치로 스크롤한다. */
function Layout() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    const target = hash ? document.getElementById(hash.slice(1)) : null;
    if (!target) {
      window.scrollTo(0, 0);
      return undefined;
    }

    target.scrollIntoView();
    // GitHub 카드 등이 늦게 불러와져 아래 내용의 높이가 바뀌면 목적지가 밀리므로,
    // 잠깐(2.5초) 높이가 바뀔 때마다 즉시 다시 맞춘다. 사용자가 직접 스크롤하면 멈춘다.
    const realign = () => target.scrollIntoView({ behavior: "instant" });
    const observer = new ResizeObserver(realign);
    observer.observe(document.body);
    const stop = () => observer.disconnect();
    const timerId = setTimeout(stop, 2500);
    ["wheel", "touchmove", "keydown"].forEach(name => window.addEventListener(name, stop, { once: true, passive: true }));

    return () => {
      clearTimeout(timerId);
      stop();
      ["wheel", "touchmove", "keydown"].forEach(name => window.removeEventListener(name, stop));
    };
  }, [pathname, hash]);

  return (
    <>
      <Header />
      <main className="page">
        <Outlet />
      </main>
      <Footer />
      <BackToTopButton />
    </>
  );
}

export default Layout;
