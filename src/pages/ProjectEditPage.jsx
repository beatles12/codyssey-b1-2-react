import { useNavigate, useParams } from "react-router-dom";
import ProjectForm from "../components/project/ProjectForm.jsx";
import DataStatus from "../components/ui/DataStatus.jsx";
import SectionHeading from "../components/ui/SectionHeading.jsx";
import useLanguage from "../hooks/useLanguage.js";
import useProject from "../hooks/useProject.js";
import useProjectActions from "../hooks/useProjectActions.js";
import useToast from "../hooks/useToast.js";
import { toFormValues } from "../lib/projectForm.js";

/** "/projects/:id/edit" 수정 화면. 기존 값을 불러와 폼에 채우고, 저장하면 상세 화면으로 돌아간다. */
function ProjectEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const showToast = useToast();
  const { project, isLoading, error, reload } = useProject(id);
  const { update, isSubmitting, error: saveError } = useProjectActions();

  const handleSubmit = async input => {
    const updated = await update(id, input);
    if (!updated) return;
    showToast(t("projects.updated"));
    navigate(`/projects/${id}`);
  };

  return (
    <section className="page-section">
      <SectionHeading eyebrow={t("projects.editEyebrow")} title={t("projects.editTitle")} />
      <DataStatus
        retryLabel={t("common.retry")}
        isLoading={isLoading}
        error={t(error)}
        onRetry={error === "errors.notFound" ? undefined : reload}
        loadingMessage={t("projects.loading")}
      >
        {project && (
          <ProjectForm
            key={project.id}
            initialValues={toFormValues(project)}
            submitLabel={t("form.submitUpdate")}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            serverError={t(saveError)}
            cancelTo={`/projects/${id}`}
          />
        )}
      </DataStatus>
    </section>
  );
}

export default ProjectEditPage;
