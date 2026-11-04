import { useMemo } from "react";
import DataStatus from "../ui/DataStatus.jsx";
import ProjectList from "../project/ProjectList.jsx";
import useLanguage from "../../hooks/useLanguage.js";
import useProjects from "../../hooks/useProjects.js";

const FEATURED_COUNT = 4;

/**
 * 홈 Work 섹션의 Supabase 관리 프로젝트(대표 표시 먼저, 최대 4개).
 * 등록된 프로젝트가 없으면 아무것도 그리지 않아, 아래 GitHub 공개 저장소가 B1-1처럼 Work의 주 내용이 된다.
 */
function FeaturedProjects() {
  const { t } = useLanguage();
  const { projects, isLoading, error, reload } = useProjects();
  const featured = useMemo(
    () => [...projects].sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured)).slice(0, FEATURED_COUNT),
    [projects],
  );

  if (!isLoading && !error && featured.length === 0) return null;

  return (
    <div className="repo-block">
      <p className="source-label">{t("work.sourceManaged")}</p>
      <DataStatus retryLabel={t("common.retry")} isLoading={isLoading} error={t(error)} onRetry={reload} loadingMessage={t("projects.loading")}>
        <ProjectList projects={featured} />
      </DataStatus>
    </div>
  );
}

export default FeaturedProjects;
