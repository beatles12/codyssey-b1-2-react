import useInView from "../../hooks/useInView.js";

/**
 * 화면에 들어올 때 아래에서 부드럽게 떠오르는 섹션.
 * @param {string} [id] #주소로 이동할 때 쓰는 id
 * @param {string} [className] 추가 클래스
 */
function RevealSection({ id, className = "", children }) {
  const [ref, isInView] = useInView({ threshold: 0.15 });

  return (
    <section ref={ref} id={id} className={`page-section reveal ${className}${isInView ? " visible" : ""}`}>
      {children}
    </section>
  );
}

export default RevealSection;
