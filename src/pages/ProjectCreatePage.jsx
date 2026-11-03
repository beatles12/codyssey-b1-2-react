import SectionHeading from "../components/ui/SectionHeading.jsx";

/** "/projects/new" 등록 화면. 폼은 6단계에서 연결한다. */
function ProjectCreatePage() {
  return (
    <section className="page-section">
      <SectionHeading eyebrow="NEW PROJECT" title="새 프로젝트 등록" />
    </section>
  );
}

export default ProjectCreatePage;
