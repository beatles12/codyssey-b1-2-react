import Button from "../components/ui/Button.jsx";
import SectionHeading from "../components/ui/SectionHeading.jsx";

/** 정의되지 않은 모든 주소("*")에서 보여주는 404 화면. */
function NotFoundPage() {
  return (
    <section className="page-section not-found">
      <SectionHeading
        eyebrow="404 NOT FOUND"
        title="페이지를 찾을 수 없습니다."
        description="주소가 바뀌었거나 존재하지 않는 페이지입니다."
      />
      <div className="link-row">
        <Button to="/" icon="→">
          홈으로
        </Button>
        <Button to="/projects" icon="→">
          프로젝트 보기
        </Button>
      </div>
    </section>
  );
}

export default NotFoundPage;
