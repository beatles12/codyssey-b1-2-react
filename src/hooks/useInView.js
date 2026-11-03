import { useEffect, useRef, useState } from "react";

/**
 * 요소가 화면에 처음 들어왔는지 알려주는 훅. 한 번 보이면 계속 true.
 * @returns {[React.RefObject, boolean]} 요소에 붙일 ref와 보임 여부
 */
function useInView({ threshold = 0.2, rootMargin = "0px" } = {}) {
  const ref = useRef(null);
  const [isInView, setIsInView] = useState(() => typeof IntersectionObserver === "undefined");

  useEffect(() => {
    const element = ref.current;
    if (!element || isInView) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setIsInView(true);
        observer.disconnect();
      },
      { threshold, rootMargin },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold, rootMargin, isInView]);

  return [ref, isInView];
}

export default useInView;
