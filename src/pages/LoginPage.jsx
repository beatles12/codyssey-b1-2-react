import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import Button from "../components/ui/Button.jsx";
import FormField from "../components/ui/FormField.jsx";
import SectionHeading from "../components/ui/SectionHeading.jsx";
import useAuth from "../hooks/useAuth.js";
import useLanguage from "../hooks/useLanguage.js";
import useToast from "../hooks/useToast.js";
import { toErrorKey } from "../lib/errors.js";
import { hasErrors, validateLogin } from "../lib/validators.js";

/** "/login" 관리자 로그인 화면. 공개 회원가입은 없고, 로그인에 성공하면 원래 가려던 화면으로 이동한다. */
function LoginPage() {
  const { user, signIn } = useAuth();
  const { t } = useLanguage();
  const showToast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [values, setValues] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const redirectTo = location.state?.from?.pathname ?? "/projects";

  if (user && !isSubmitting) return <Navigate to={redirectTo} replace />;

  const handleChange = event => {
    const nextValues = { ...values, [event.target.name]: event.target.value };
    setValues(nextValues);
    if (errors[event.target.name]) setErrors(validateLogin(nextValues));
  };

  const handleSubmit = async event => {
    event.preventDefault();
    const nextErrors = validateLogin(values);
    setErrors(nextErrors);
    setServerError("");
    if (hasErrors(nextErrors)) return;

    setIsSubmitting(true);
    try {
      await signIn(values.email, values.password);
      showToast(t("auth.success"));
      navigate(redirectTo, { replace: true });
    } catch (error) {
      setServerError(toErrorKey(error));
      setIsSubmitting(false);
    }
  };

  return (
    <section className="page-section login-page">
      <SectionHeading eyebrow={t("auth.eyebrow")} title={t("auth.title")} description={t("auth.description")} />
      <form className="login-form" noValidate onSubmit={handleSubmit}>
        {serverError && (
          <p className="form-alert" role="alert">
            {t(serverError)}
          </p>
        )}
        <FormField label={t("auth.email")} name="email" type="email" value={values.email} onChange={handleChange} error={t(errors.email)} required />
        <FormField label={t("auth.password")} name="password" type="password" value={values.password} onChange={handleChange} error={t(errors.password)} required />
        <Button variant="primary" type="submit" icon="→" isLoading={isSubmitting} loadingText={t("auth.submitting")}>
          {t("auth.submit")}
        </Button>
      </form>
    </section>
  );
}

export default LoginPage;
