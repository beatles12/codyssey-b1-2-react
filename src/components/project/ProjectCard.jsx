import { useState } from "react";
import { Link } from "react-router-dom";
import TagList from "../ui/TagList.jsx";

/**
 * B1-1 Work 카드 모양의 프로젝트 카드. 목록·홈·GitHub·미리보기에서 함께 쓴다.
 * @param {{title: string, summary: string, techStack: string[], imageUrl?: string}} project 카드 내용
 * @param {number} index 0부터 시작하는 순번 (01, 02…로 표시)
 * @param {string} [label] 순번 옆 작은 분류 이름
 * @param {string} [href] 카드 전체를 누르면 이동할 주소. 없으면 링크 없음(미리보기)
 * @param {boolean} [isExternal] true면 새 탭으로 외부 주소를 연다
 * @param {string} [linkLabel] 링크의 화면 낭독기용 이름
 */
function ProjectCard({ project, index, label, href, isExternal = false, linkLabel }) {
  const [failedImage, setFailedImage] = useState("");
  const { title, summary, techStack = [], imageUrl = "" } = project;
  const showImage = Boolean(imageUrl) && failedImage !== imageUrl;
  const number = String(index + 1).padStart(2, "0");
  const linkName = `${title} ${linkLabel ?? ""}`.trim();

  return (
    <article className="project-card">
      <div className="project-visual" aria-hidden="true">
        {showImage ? (
          <img src={imageUrl} alt="" loading="lazy" onError={() => setFailedImage(imageUrl)} />
        ) : (
          <span className="project-initial">{title.trim().charAt(0).toUpperCase() || "S"}</span>
        )}
      </div>
      <p className="project-card-number">
        {number}
        {label && <span> · {label}</span>}
      </p>
      <h3>{title}</h3>
      <p className="project-summary">{summary}</p>
      <TagList tags={techStack.slice(0, 3)} />
      {href && isExternal && (
        <a className="project-card-link" href={href} target="_blank" rel="noopener noreferrer" aria-label={linkName}>
          →
        </a>
      )}
      {href && !isExternal && (
        <Link className="project-card-link" to={href} aria-label={linkName}>
          →
        </Link>
      )}
    </article>
  );
}

export default ProjectCard;
