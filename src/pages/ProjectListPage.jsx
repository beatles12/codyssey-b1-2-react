import { Link } from "react-router-dom";
import SectionHeading from "../components/SectionHeading.jsx";

function ProjectListPage() {
  return (
    <section className="page-section">
      <SectionHeading
        eyebrow="SELECTED WORK"
        title="Projects"
        description="문제를 발견하고 서비스로 연결한 프로젝트를 모았습니다."
      />
      <Link className="primary-link" to="/projects/new">
        새 프로젝트 등록 <span>+</span>
      </Link>
    </section>
  );
}

export default ProjectListPage;
