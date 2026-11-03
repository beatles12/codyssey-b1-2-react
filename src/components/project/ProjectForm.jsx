import { useState } from "react";
import ProjectCard from "./ProjectCard.jsx";
import Button from "../ui/Button.jsx";
import FormField from "../ui/FormField.jsx";
import useLanguage from "../../hooks/useLanguage.js";
import { CATEGORIES, EMPTY_PROJECT_FORM, SUMMARY_MAX, toProjectInput, validateProjectForm } from "../../lib/projectForm.js";
import { hasErrors } from "../../lib/validators.js";

/**
 * 프로젝트 등록·수정 공통 폼. 입력값은 이 컴포넌트의 state에 있고, 검사를 통과하면 onSubmit으로 넘긴다.
 * 오른쪽 미리보기 카드는 입력할 때마다 바로 바뀐다.
 * @param {object} [initialValues] 처음 채워 둘 폼 값 (수정 화면)
 * @param {string} submitLabel 제출 버튼 글자
 * @param {(project: object) => void} onSubmit 검사를 통과한 저장용 프로젝트를 받는다
 * @param {boolean} isSubmitting 저장 중이면 버튼을 비활성화
 * @param {string} [serverError] 저장 실패 문구 (폼 위에 표시)
 * @param {string} cancelTo 취소 버튼으로 돌아갈 주소
 */
function ProjectForm({ initialValues = EMPTY_PROJECT_FORM, submitLabel, onSubmit, isSubmitting, serverError, cancelTo }) {
  const { t } = useLanguage();
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const preview = toProjectInput(values);
  const categoryOptions = CATEGORIES.map(category => ({ value: category, label: t(`categories.${category}`) }));

  const handleChange = event => {
    const { name, value, type, checked } = event.target;
    const nextValues = { ...values, [name]: type === "checkbox" ? checked : value };
    setValues(nextValues);
    if (errors[name]) setErrors(validateProjectForm(nextValues));
  };

  const handleSubmit = event => {
    event.preventDefault();
    const nextErrors = validateProjectForm(values);
    setErrors(nextErrors);
    if (!hasErrors(nextErrors)) onSubmit(toProjectInput(values));
  };

  /** 이름이 name인 입력칸에 공통 props(값·변경·오류)를 채워 준다. */
  const fieldProps = name => ({ name, value: values[name], onChange: handleChange, error: t(errors[name]) });

  return (
    <div className="project-form-layout">
      <form className="project-form" noValidate onSubmit={handleSubmit}>
        {serverError && (
          <p className="form-alert" role="alert">
            {serverError}
          </p>
        )}
        {hasErrors(errors) && <p className="form-alert">{t("form.hasErrors")}</p>}

        <FormField label={t("form.title")} placeholder={t("form.titlePlaceholder")} required {...fieldProps("title")} />
        <FormField
          label={t("form.summary")}
          placeholder={t("form.summaryPlaceholder")}
          hint={`${values.summary.trim().length}/${SUMMARY_MAX}`}
          required
          {...fieldProps("summary")}
        />
        <FormField label={t("form.description")} placeholder={t("form.descriptionPlaceholder")} as="textarea" rows={6} required {...fieldProps("description")} />
        <div className="form-row">
          <FormField label={t("form.category")} as="select" options={categoryOptions} required {...fieldProps("category")} />
          <FormField label={t("form.techStack")} placeholder={t("form.techStackPlaceholder")} {...fieldProps("techStack")} />
        </div>
        <div className="form-row">
          <FormField label={t("form.role")} placeholder={t("form.rolePlaceholder")} {...fieldProps("role")} />
          <FormField label={t("form.period")} placeholder={t("form.periodPlaceholder")} {...fieldProps("period")} />
        </div>
        <div className="form-row">
          <FormField label={t("form.githubUrl")} type="url" placeholder="https://github.com/..." {...fieldProps("githubUrl")} />
          <FormField label={t("form.demoUrl")} type="url" placeholder="https://..." {...fieldProps("demoUrl")} />
        </div>
        <FormField label={t("form.imageUrl")} placeholder={t("form.imageUrlPlaceholder")} {...fieldProps("imageUrl")} />
        <label className="checkbox-field">
          <input type="checkbox" name="isFeatured" checked={values.isFeatured} onChange={handleChange} />
          {t("form.isFeatured")}
        </label>

        <div className="form-actions">
          <Button to={cancelTo}>{t("form.cancel")}</Button>
          <Button variant="primary" type="submit" icon="→" isLoading={isSubmitting} loadingText={t("form.submitting")}>
            {submitLabel}
          </Button>
        </div>
      </form>

      <aside className="project-preview" aria-label={t("projects.preview")}>
        <p className="eyebrow">{t("projects.preview")}</p>
        <ProjectCard
          project={{
            ...preview,
            title: preview.title || t("projects.untitled"),
            summary: preview.summary || t("projects.summaryPlaceholder"),
          }}
          index={0}
          label={t(`categories.${preview.category}`)}
        />
        <p className="preview-hint">{t("projects.previewHint")}</p>
      </aside>
    </div>
  );
}

export default ProjectForm;
