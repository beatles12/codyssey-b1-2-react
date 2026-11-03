import Button from "../components/ui/Button.jsx";
import SectionHeading from "../components/ui/SectionHeading.jsx";

/** "/projects" 프로젝트 목록 화면. 목록·필터는 6단계에서 Supabase 데이터로 채운다. */
function ProjectListPage() {
  return (
    <section className="page-section">
      <SectionHeading
        eyebrow="SELECTED WORK"
        title="Projects"
        description="문제를 발견하고 서비스로 연결한 프로젝트를 모았습니다."
      />
      <Button to="/projects/new" icon="+">
        새 프로젝트 등록
      </Button>
    </section>
  );
}

export default ProjectListPage;
