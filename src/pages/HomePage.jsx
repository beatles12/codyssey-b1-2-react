import { Link } from "react-router-dom";
import SectionHeading from "../components/SectionHeading.jsx";

function HomePage() {
  return (
    <section className="page-section">
      <SectionHeading
        eyebrow="PLANNER · EDUCATOR · AI BUILDER"
        title="불편함 속에서 서비스는 시작됩니다."
        description="복잡한 문제를 관찰하고 정리해, 실제로 사용할 수 있는 서비스로 연결합니다."
      />
      <Link className="primary-link" to="/projects">
        Selected Work <span>→</span>
      </Link>
    </section>
  );
}

export default HomePage;
