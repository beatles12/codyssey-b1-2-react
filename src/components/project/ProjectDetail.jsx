import Button from "../ui/Button.jsx";
import TagList from "../ui/TagList.jsx";
import useLanguage from "../../hooks/useLanguage.js";
import { toSafeImageUrl, toSafeLinkUrl } from "../../lib/validators.js";

/**
 * 프로젝트 한 개의 모든 정보를 보여주는 상세 화면 본문. 링크·이미지는 안전한 주소일 때만 표시한다.
 * @param {object} project 보여줄 프로젝트
 * @param {React.ReactNode} [actions] 수정·삭제 버튼 자리 (관리자에게만 전달)
 */
function ProjectDetail({ project, actions }) {
  const { t } = useLanguage();
  const imageUrl = toSafeImageUrl(project.imageUrl);
  const githubUrl = toSafeLinkUrl(project.githubUrl);
  const demoUrl = toSafeLinkUrl(project.demoUrl);
  const meta = [
    { label: t("projects.role"), value: project.role },
    { label: t("projects.period"), value: project.period },
  ].filter(item => item.value);

  return (
    <article className="project-detail">
      <header className="detail-header">
        <p className="eyebrow">
          {t("projects.detailEyebrow")} · {t(`categories.${project.category}`)}
        </p>
        <h1>{project.title}</h1>
        <p className="detail-summary">{project.summary}</p>
        {actions && <div className="detail-actions">{actions}</div>}
      </header>

      {imageUrl && <img className="detail-image" src={imageUrl} alt={project.title} />}

      <div className="detail-body">
        <p className="detail-description">{project.description}</p>
        <aside className="detail-meta">
          <dl>
            {meta.map(item => (
              <div key={item.label}>
                <dt>{item.label}</dt>
                <dd>{item.value}</dd>
              </div>
            ))}
            {project.techStack.length > 0 && (
              <div>
                <dt>{t("projects.techStack")}</dt>
                <dd>
                  <TagList tags={project.techStack} />
                </dd>
              </div>
            )}
          </dl>
          <div className="link-row">
            {githubUrl && (
              <Button href={githubUrl} icon="↗">
                {t("projects.github")}
              </Button>
            )}
            {demoUrl && (
              <Button href={demoUrl} icon="↗">
                {t("projects.demo")}
              </Button>
            )}
          </div>
        </aside>
      </div>
    </article>
  );
}

export default ProjectDetail;
