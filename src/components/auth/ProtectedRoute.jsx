import { Navigate, Outlet, useLocation } from "react-router-dom";
import LoadingState from "../ui/LoadingState.jsx";
import useAuth from "../../hooks/useAuth.js";
import useLanguage from "../../hooks/useLanguage.js";

/** 로그인한 사람만 안쪽 라우트를 볼 수 있게 한다. 방문자는 로그인 화면으로 보내고, 원래 가려던 주소를 기억한다. */
function ProtectedRoute() {
  const { user, isLoading } = useAuth();
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
  return <Outlet />;
}

export default ProtectedRoute;
