import { useParams } from "react-router-dom";
import SectionHeading from "../components/ui/SectionHeading.jsx";

/** "/projects/:id/edit" 수정 화면. 폼은 6단계에서 연결한다. */
function ProjectEditPage() {
  const { id } = useParams();

  return (
    <section className="page-section">
      <SectionHeading eyebrow="EDIT PROJECT" title={`프로젝트 #${id} 수정`} />
    </section>
  );
}

export default ProjectEditPage;
