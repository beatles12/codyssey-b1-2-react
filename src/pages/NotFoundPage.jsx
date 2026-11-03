import Button from "../components/ui/Button.jsx";
import SectionHeading from "../components/ui/SectionHeading.jsx";
import useLanguage from "../hooks/useLanguage.js";

/** 정의되지 않은 모든 주소("*")에서 보여주는 404 화면. */
function NotFoundPage() {
  const { t } = useLanguage();

  return (
    <section className="page-section not-found">
      <SectionHeading eyebrow={t("notFound.eyebrow")} title={t("notFound.title")} description={t("notFound.description")} />
      <div className="link-row">
        <Button to="/" icon="→">
          {t("notFound.home")}
        </Button>
        <Button to="/projects" icon="→">
          {t("notFound.projects")}
        </Button>
      </div>
    </section>
  );
}

export default NotFoundPage;
