import { useMemo, useState } from "react";
import ProjectList from "../components/project/ProjectList.jsx";
import Button from "../components/ui/Button.jsx";
import DataStatus from "../components/ui/DataStatus.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import FilterBar from "../components/ui/FilterBar.jsx";
import SectionHeading from "../components/ui/SectionHeading.jsx";
import useLanguage from "../hooks/useLanguage.js";
import useProjects from "../hooks/useProjects.js";
import { CATEGORIES } from "../lib/projectForm.js";

const ALL = "all";

/** "/projects" 목록 화면. 분류 필터(state)를 바꾸면 보이는 카드가 바로 바뀐다. */
function ProjectListPage() {
  const { t } = useLanguage();
  const { projects, isLoading, error, reload } = useProjects();
  const [category, setCategory] = useState(ALL);
  const visibleProjects = useMemo(
    () => (category === ALL ? projects : projects.filter(project => project.category === category)),
    [projects, category],
  );
  const filterOptions = [ALL, ...CATEGORIES].map(value => ({
    value,
    label: value === ALL ? t("projects.all") : t(`categories.${value}`),
  }));
  const createButton = (
    <Button variant="primary" to="/projects/new" icon="+">
      {t("projects.create")}
    </Button>
  );

  return (
    <section className="page-section">
      <SectionHeading eyebrow={t("projects.eyebrow")} title={t("projects.title")} description={t("projects.description")} />
      <DataStatus
        isLoading={isLoading}
        error={t(error)}
        isEmpty={projects.length === 0}
        onRetry={reload}
        loadingMessage={t("projects.loading")}
        emptyMessage={t("projects.empty")}
        emptyAction={createButton}
      >
        <div className="list-toolbar">
          <div>
            <p className="list-count" role="status">
              {t("projects.count", { count: visibleProjects.length })}
            </p>
            <FilterBar label={t("projects.filterLabel")} options={filterOptions} value={category} onChange={setCategory} />
          </div>
          {createButton}
        </div>
        {visibleProjects.length > 0 ? <ProjectList projects={visibleProjects} /> : <EmptyState message={t("projects.emptyFiltered")} />}
      </DataStatus>
    </section>
  );
}

export default ProjectListPage;
