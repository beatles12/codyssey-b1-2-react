import ProjectCard from "./ProjectCard.jsx";
import DataStatus from "../ui/DataStatus.jsx";
import useGithubRepos from "../../hooks/useGithubRepos.js";
import useLanguage from "../../hooks/useLanguage.js";

/**
 * GitHub API로 불러온 공개 저장소 카드 목록 (B1-1 Work 화면과 같은 출처).
 * Supabase로 직접 관리하는 프로젝트와 구분되도록 출처 라벨을 함께 보여준다.
 * @param {boolean} [showSource] 카드 위에 "GitHub 공개 저장소" 출처 라벨을 표시할지
 */
function GithubRepoList({ showSource = true }) {
  const { t, language } = useLanguage();
  const { repos, isLoading, error, reload } = useGithubRepos();

  return (
    <div className="repo-block">
      {showSource && <p className="source-label">{t("work.sourceGithub")}</p>}
      <DataStatus
        retryLabel={t("common.retry")}
        isLoading={isLoading}
        error={error && t("github.error")}
        isEmpty={repos.length === 0}
        onRetry={reload}
        loadingMessage={t("github.loading")}
        emptyMessage={t("github.empty")}
      >
        <div className="project-grid">
          {repos.map((repo, index) => (
            <ProjectCard
              key={repo.id}
              project={{ ...repo, summary: repo.summary[language] || t("github.fallbackDescription") }}
              index={index}
              label="GitHub"
              href={repo.url}
              isExternal
              linkLabel={t("github.openRepo")}
            />
          ))}
        </div>
      </DataStatus>
    </div>
  );
}

export default GithubRepoList;
