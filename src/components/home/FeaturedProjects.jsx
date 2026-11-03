import { useMemo } from "react";
import DataStatus from "../ui/DataStatus.jsx";
import ProjectList from "../project/ProjectList.jsx";
import useLanguage from "../../hooks/useLanguage.js";
import useProjects from "../../hooks/useProjects.js";

const FEATURED_COUNT = 4;

/** 홈 Work 섹션의 대표 프로젝트(대표 표시 먼저, 최대 4개). */
function FeaturedProjects() {
  const { t } = useLanguage();
  const { projects, isLoading, error, reload } = useProjects();
  const featured = useMemo(
    () => [...projects].sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured)).slice(0, FEATURED_COUNT),
    [projects],
  );

  return (
    <DataStatus
        retryLabel={t("common.retry")}
      isLoading={isLoading}
      error={t(error)}
      isEmpty={featured.length === 0}
      onRetry={reload}
      loadingMessage={t("projects.loading")}
      emptyMessage={t("projects.empty")}
    >
      <ProjectList projects={featured} />
    </DataStatus>
  );
}

export default FeaturedProjects;
