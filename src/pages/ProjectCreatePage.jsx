import { useNavigate } from "react-router-dom";
import ProjectForm from "../components/project/ProjectForm.jsx";
import SectionHeading from "../components/ui/SectionHeading.jsx";
import useLanguage from "../hooks/useLanguage.js";
import useProjectActions from "../hooks/useProjectActions.js";
import useToast from "../hooks/useToast.js";

/** "/projects/new" 등록 화면. 저장에 성공하면 새 프로젝트의 상세 화면으로 이동한다. */
function ProjectCreatePage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const showToast = useToast();
  const { create, isSubmitting, error } = useProjectActions();

  const handleSubmit = async input => {
    const created = await create(input);
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
