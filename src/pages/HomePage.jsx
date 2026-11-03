import Button from "../components/ui/Button.jsx";
import SectionHeading from "../components/ui/SectionHeading.jsx";

/** "/" 홈 화면. Hero·Expertise·대표 프로젝트·Contact는 4단계에서 채운다. */
function HomePage() {
  return (
    <section className="page-section">
      <SectionHeading
        eyebrow="PLANNER · EDUCATOR · AI BUILDER"
        title="불편함 속에서 서비스는 시작됩니다."
        description="복잡한 문제를 관찰하고 정리해, 실제로 사용할 수 있는 서비스로 연결합니다."
      />
      <Button to="/projects" icon="→">
        Selected Work
      </Button>
    </section>
  );
}

export default HomePage;
