import { useMemo, useState } from "react";
import GithubRepoList from "../components/project/GithubRepoList.jsx";
import ProjectList from "../components/project/ProjectList.jsx";
import Button from "../components/ui/Button.jsx";
import DataStatus from "../components/ui/DataStatus.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import FilterBar from "../components/ui/FilterBar.jsx";
import SectionHeading from "../components/ui/SectionHeading.jsx";
import useAuth from "../hooks/useAuth.js";
import useLanguage from "../hooks/useLanguage.js";
import useProjects from "../hooks/useProjects.js";
import { CATEGORIES } from "../lib/projectForm.js";

const ALL = "all";

/**
 * "/projects" 목록 화면. 분류 필터(state)를 바꾸면 보이는 카드가 바로 바뀐다. 등록 버튼은 관리자에게만 보인다.
 * 제목은 타이핑되고, 제목 → 목록 → 카드 순서로 차례로 떠오른다 (움직임 줄이기 설정이면 바로 표시).
 */
function ProjectListPage() {
  const { t } = useLanguage();
  const { isAdmin } = useAuth();
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
  const createButton = isAdmin && (
    <Button variant="primary" to="/projects/new" icon="+">
      {t("projects.create")}
    </Button>
  );

  return (
    <section className="page-section">
      <div className="enter">
        <SectionHeading eyebrow={t("projects.eyebrow")} title={t("projects.title")} description={t("projects.description")} isTyping />
      </div>
      <div className="enter enter-delay-1">
        <p className="source-label">{t("work.sourceManaged")}</p>
        <DataStatus
          retryLabel={t("common.retry")}
          isLoading={isLoading}
          error={t(error)}
          isEmpty={projects.length === 0}
          onRetry={reload}
          loadingMessage={t("projects.loading")}
          emptyMessage={t("projects.empty")}
          emptyDescription={isAdmin ? t("projects.emptyAdminHint") : t("projects.emptyHint")}
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
          {visibleProjects.length > 0 ? (
            <ProjectList projects={visibleProjects} isStaggered />
          ) : (
            <EmptyState
              message={t("projects.emptyFiltered")}
              description={t("projects.emptyFilteredHint")}
              action={<Button onClick={() => setCategory(ALL)}>{t("projects.showAll")}</Button>}
            />
          )}
        </DataStatus>
        <GithubRepoList />
      </div>
    </section>
  );
}

export default ProjectListPage;
