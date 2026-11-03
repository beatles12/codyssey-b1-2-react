import { Link } from "react-router-dom";
import SectionHeading from "../components/SectionHeading.jsx";

function NotFoundPage() {
  return (
    <section className="page-section not-found">
      <SectionHeading
        eyebrow="404 NOT FOUND"
        title="페이지를 찾을 수 없습니다."
        description="주소가 바뀌었거나 존재하지 않는 페이지입니다."
      />
      <div className="link-row">
        <Link className="primary-link" to="/">
          홈으로 <span>→</span>
        </Link>
        <Link className="primary-link" to="/projects">
          프로젝트 보기 <span>→</span>
        </Link>
      </div>
    </section>
  );
}

export default NotFoundPage;
