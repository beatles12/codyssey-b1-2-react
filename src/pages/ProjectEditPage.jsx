import { useParams } from "react-router-dom";
import SectionHeading from "../components/SectionHeading.jsx";

function ProjectEditPage() {
  const { id } = useParams();

  return (
    <section className="page-section">
      <SectionHeading eyebrow="EDIT PROJECT" title={`프로젝트 #${id} 수정`} />
    </section>
  );
}

export default ProjectEditPage;
