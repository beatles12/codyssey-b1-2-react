import ProjectCard from "./ProjectCard.jsx";
import useLanguage from "../../hooks/useLanguage.js";

/**
 * 프로젝트 카드 목록. 카드를 누르면 상세 화면(/projects/:id)으로 이동한다.
 * @param {object[]} projects 보여줄 프로젝트 배열
 */
function ProjectList({ projects }) {
  const { t } = useLanguage();

  return (
    <div className="project-grid">
      {projects.map((project, index) => (
        <ProjectCard
          key={project.id}
          project={project}
          index={index}
          label={t(`categories.${project.category}`)}
          href={`/projects/${project.id}`}
          linkLabel={t("projects.open")}
        />
      ))}
    </div>
  );
}

export default ProjectList;
