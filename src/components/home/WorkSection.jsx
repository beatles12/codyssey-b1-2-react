import Button from "../ui/Button.jsx";
import RevealSection from "../ui/RevealSection.jsx";
import SectionHeading from "../ui/SectionHeading.jsx";
import useLanguage from "../../hooks/useLanguage.js";

/** 홈의 Selected Work 섹션. children으로 대표 프로젝트 목록을 받는다. */
function WorkSection({ number, children }) {
  const { t } = useLanguage();

  return (
    <RevealSection id="work" className="projects">
      <SectionHeading number={number} eyebrow={t("work.eyebrow")} title={t("work.title")} as="h2" isTyping />
      {children}
      <div className="section-action">
        <Button to="/projects" icon="→">
          {t("work.viewAll")}
        </Button>
      </div>
    </RevealSection>
  );
}

export default WorkSection;
