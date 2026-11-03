import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ProjectDetail from "../components/project/ProjectDetail.jsx";
import Button from "../components/ui/Button.jsx";
import ConfirmDialog from "../components/ui/ConfirmDialog.jsx";
import DataStatus from "../components/ui/DataStatus.jsx";
import useAuth from "../hooks/useAuth.js";
import useLanguage from "../hooks/useLanguage.js";
import useProject from "../hooks/useProject.js";
import useProjectActions from "../hooks/useProjectActions.js";
import useToast from "../hooks/useToast.js";

/** "/projects/:id" 상세 화면. 수정·삭제 버튼은 관리자에게만 보이고, 삭제는 확인 창을 거친 뒤 실행한다. */
function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user } = useAuth();
  const showToast = useToast();
  const { project, isLoading, error, reload } = useProject(id);
  const { remove, isSubmitting, error: actionError } = useProjectActions();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const handleDelete = async () => {
    const isDeleted = await remove(id);
    setIsConfirmOpen(false);
    if (!isDeleted) return;
    showToast(t("projects.deleted"));
    navigate("/projects");
  };

  const actions = user && (
    <>
      <Button to={`/projects/${id}/edit`}>{t("projects.edit")}</Button>
      <Button variant="danger" onClick={() => setIsConfirmOpen(true)}>
        {t("projects.delete")}
      </Button>
    </>
  );

  return (
    <section className="page-section">
      <div className="back-link">
        <Button to="/projects" icon="←">
          {t("projects.back")}
        </Button>
      </div>
      {actionError && (
        <p className="form-alert" role="alert">
          {t(actionError)}
        </p>
      )}
      <DataStatus
        isLoading={isLoading}
        error={t(error)}
        onRetry={error === "errors.notFound" ? undefined : reload}
        loadingMessage={t("projects.loading")}
      >
        {project && <ProjectDetail project={project} actions={actions} />}
      </DataStatus>
      <ConfirmDialog
        open={isConfirmOpen}
        title={t("projects.deleteTitle")}
        message={t("projects.deleteMessage", { title: project?.title })}
        confirmLabel={t("projects.delete")}
        isLoading={isSubmitting}
        onConfirm={handleDelete}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </section>
  );
}

export default ProjectDetailPage;
