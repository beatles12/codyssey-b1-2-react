/**
 * 기술·키워드를 둥근 태그 목록으로 보여준다. 태그가 없으면 아무것도 그리지 않는다.
 * @param {string[]} tags 태그 문자열 목록
 */
function TagList({ tags = [] }) {
  if (tags.length === 0) return null;

  return (
    <ul className="tag-list">
      {tags.map(tag => (
        <li key={tag}>{tag}</li>
      ))}
    </ul>
  );
}

export default TagList;
