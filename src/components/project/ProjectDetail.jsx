import Button from "../ui/Button.jsx";
import TagList from "../ui/TagList.jsx";
import useLanguage from "../../hooks/useLanguage.js";

/**
 * 프로젝트 한 개의 모든 정보를 보여주는 상세 화면 본문.
 * @param {object} project 보여줄 프로젝트
 * @param {React.ReactNode} [actions] 수정·삭제 버튼 자리 (관리자에게만 전달)
 */
function ProjectDetail({ project, actions }) {
  const { t } = useLanguage();
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

      {project.imageUrl && <img className="detail-image" src={project.imageUrl} alt={project.title} />}

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
            {project.githubUrl && (
              <Button href={project.githubUrl} icon="↗">
                {t("projects.github")}
              </Button>
            )}
            {project.demoUrl && (
              <Button href={project.demoUrl} icon="↗">
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
