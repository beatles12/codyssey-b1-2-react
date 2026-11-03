/**
 * 섹션 제목 묶음(작은 머리말 + 제목 + 설명)을 B1-1 스타일로 보여준다.
 * @param {string} eyebrow 제목 위 작은 머리말
 * @param {string} title 제목
 * @param {string} [description] 제목 아래 설명
 * @param {"h1"|"h2"} [as] 제목 태그. 페이지 대표 제목은 h1, 섹션 제목은 h2
 */
function SectionHeading({ eyebrow, title, description, as: Tag = "h1" }) {
  return (
    <header className="section-heading">
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <div>
        <Tag>{title}</Tag>
        {description && <p className="section-description">{description}</p>}
      </div>
    </header>
  );
}

export default SectionHeading;
