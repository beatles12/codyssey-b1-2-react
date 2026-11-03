import { Navigate, Outlet, useLocation } from "react-router-dom";
import Button from "../ui/Button.jsx";
import ErrorState from "../ui/ErrorState.jsx";
import LoadingState from "../ui/LoadingState.jsx";
import useAuth from "../../hooks/useAuth.js";
import useLanguage from "../../hooks/useLanguage.js";

/**
 * 관리자만 안쪽 라우트를 볼 수 있게 한다.
 * 방문자는 로그인 화면으로 보내고(원래 주소 기억), 관리자가 아닌 계정에는 권한 없음 안내를 보여준다.
 */
function ProtectedRoute() {
  const { user, isAdmin, isLoading } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();

  if (isLoading) {
    return (
      <section className="page-section">
        <LoadingState message={t("auth.checking")} />
      </section>
    );
  }
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  if (!isAdmin) {
    return (
      <section className="page-section">
        <ErrorState message={t("errors.notAdmin")} />
        <div className="section-action">
          <Button to="/projects" icon="→">
            {t("projects.back")}
          </Button>
        </div>
      </section>
    );
  }
  return <Outlet />;
}

export default ProtectedRoute;
