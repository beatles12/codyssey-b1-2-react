import { useEffect, useState } from "react";

/**
 * 페이지가 offset(px)보다 아래로 스크롤됐는지 알려주는 훅.
 * @param {number} [offset] 기준 스크롤 위치
 * @returns {boolean} 기준보다 내려갔으면 true
 */
function useScrolled(offset = 20) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > offset);

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [offset]);

  return isScrolled;
}

export default useScrolled;
