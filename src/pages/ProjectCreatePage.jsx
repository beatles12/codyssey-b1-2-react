import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ProjectForm from "../components/project/ProjectForm.jsx";
import SectionHeading from "../components/ui/SectionHeading.jsx";
import useLanguage from "../hooks/useLanguage.js";
import useProjectActions from "../hooks/useProjectActions.js";
import useToast from "../hooks/useToast.js";
import { createProjectId } from "../lib/id.js";

/**
 * "/projects/new" 등록 화면. 저장에 성공하면 새 프로젝트의 상세 화면으로 이동한다.
 * 새 프로젝트 id를 화면이 열릴 때 한 번 만들어, 실패 후 다시 저장해도 같은 id를 보낸다(중복 등록 방지).
 */
function ProjectCreatePage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const showToast = useToast();
  const { create, isSubmitting, error } = useProjectActions();
  const [projectId] = useState(createProjectId);

  const handleSubmit = async input => {
    const created = await create(input, projectId);
    if (!created) return;
    showToast(t("projects.created"));
    navigate(`/projects/${created.id}`);
  };

  return (
    <section className="page-section">
      <SectionHeading eyebrow={t("projects.createEyebrow")} title={t("projects.createTitle")} />
      <ProjectForm
        submitLabel={t("form.submitCreate")}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        serverError={t(error)}
        cancelTo="/projects"
      />
    </section>
  );
}

export default ProjectCreatePage;
