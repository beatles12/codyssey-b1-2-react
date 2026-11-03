import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/auth/ProtectedRoute.jsx";
import Layout from "./components/layout/Layout.jsx";
import HomePage from "./pages/HomePage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import AboutPage from "./pages/AboutPage.jsx";
import ProjectListPage from "./pages/ProjectListPage.jsx";
import ProjectDetailPage from "./pages/ProjectDetailPage.jsx";
import ProjectCreatePage from "./pages/ProjectCreatePage.jsx";
import ProjectEditPage from "./pages/ProjectEditPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";

/** 주소(URL)와 페이지 컴포넌트를 연결한다. 등록·수정 화면은 ProtectedRoute로 로그인한 관리자만 들어갈 수 있다. */
function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/projects" element={<ProjectListPage />} />
        <Route path="/projects/:id" element={<ProjectDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/projects/new" element={<ProjectCreatePage />} />
          <Route path="/projects/:id/edit" element={<ProjectEditPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;
