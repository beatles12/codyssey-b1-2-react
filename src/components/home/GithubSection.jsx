import RevealSection from "../ui/RevealSection.jsx";
import SectionHeading from "../ui/SectionHeading.jsx";
import GithubRepoList from "../project/GithubRepoList.jsx";
import useLanguage from "../../hooks/useLanguage.js";

/** About 페이지의 GitHub 섹션: GitHub API로 불러온 실제 저장소 카드. */
function GithubSection() {
  const { t } = useLanguage();

  return (
    <RevealSection id="github" className="projects">
      <SectionHeading eyebrow={t("github.eyebrow")} title={t("github.title")} description={t("github.description")} as="h2" />
      <GithubRepoList showSource={false} />
    </RevealSection>
  );
}

export default GithubSection;
