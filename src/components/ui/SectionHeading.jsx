import TypingHeading from "./TypingHeading.jsx";

/**
 * 섹션 제목 묶음(번호·머리말 + 제목 + 설명)을 B1-1 스타일로 보여준다.
 * @param {string} eyebrow 제목 위 작은 머리말
 * @param {string} title 제목 (줄바꿈은 \n)
 * @param {string} [number] 머리말 위 섹션 번호 (예: "02")
 * @param {string} [description] 제목 아래 설명
 * @param {"h1"|"h2"} [as] 제목 태그. 페이지 대표 제목은 h1, 섹션 제목은 h2
 * @param {boolean} [isTyping] true면 화면에 보일 때 타이핑 효과
 */
function SectionHeading({ eyebrow, title, number, description, as: Tag = "h1", isTyping = false }) {
  return (
    <header className="section-heading">
      <div className="section-label">
        {number && <span>{number}</span>}
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      </div>
      <div>
        {isTyping ? <TypingHeading as={Tag} text={title} /> : <Tag>{title}</Tag>}
        {description && <p className="section-description">{description}</p>}
      </div>
    </header>
  );
}

export default SectionHeading;
