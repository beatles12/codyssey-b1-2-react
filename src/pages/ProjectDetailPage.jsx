import { Link, useParams } from "react-router-dom";
import SectionHeading from "../components/SectionHeading.jsx";

function ProjectDetailPage() {
  const { id } = useParams();

  return (
    <section className="page-section">
      <SectionHeading eyebrow="PROJECT DETAIL" title={`프로젝트 #${id}`} />
      <Link className="primary-link" to={`/projects/${id}/edit`}>
        수정하기 <span>→</span>
      </Link>
    </section>
  );
}

export default ProjectDetailPage;
