import DataStatus from "../ui/DataStatus.jsx";
import RevealSection from "../ui/RevealSection.jsx";
import SectionHeading from "../ui/SectionHeading.jsx";
import ProjectCard from "../project/ProjectCard.jsx";
import useGithubRepos from "../../hooks/useGithubRepos.js";
import useLanguage from "../../hooks/useLanguage.js";

/** GitHub API로 불러온 실제 저장소를 카드로 보여준다. */
function GithubSection() {
  const { t, language } = useLanguage();
  const { repos, isLoading, error, reload } = useGithubRepos();

  return (
    <RevealSection id="github" className="projects">
      <SectionHeading eyebrow={t("github.eyebrow")} title={t("github.title")} description={t("github.description")} as="h2" />
      <DataStatus
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
              href={repo.url}
              isExternal
              linkLabel={t("github.openRepo")}
            />
          ))}
        </div>
      </DataStatus>
    </RevealSection>
  );
}

export default GithubSection;
