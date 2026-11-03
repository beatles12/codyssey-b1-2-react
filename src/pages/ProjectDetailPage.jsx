import { useParams } from "react-router-dom";
import Button from "../components/ui/Button.jsx";
import SectionHeading from "../components/ui/SectionHeading.jsx";

/** "/projects/:id" 상세 화면. 주소의 :id 값을 useParams로 읽는다. */
function ProjectDetailPage() {
  const { id } = useParams();

  return (
    <section className="page-section">
      <SectionHeading eyebrow="PROJECT DETAIL" title={`프로젝트 #${id}`} />
      <Button to={`/projects/${id}/edit`} icon="→">
        수정하기
      </Button>
    </section>
  );
}

export default ProjectDetailPage;
