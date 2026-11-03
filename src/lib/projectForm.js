// 프로젝트 폼 값(문자열 위주)과 저장용 프로젝트 객체 사이의 변환, 그리고 입력값 검사.
import { isOptionalImageUrl, isOptionalUrl } from "./validators.js";

export const CATEGORIES = ["planning", "education", "ai", "startup", "development"];
export const TITLE_MAX = 60;
export const SUMMARY_MAX = 120;

export const EMPTY_PROJECT_FORM = {
  title: "",
  summary: "",
  description: "",
  category: "planning",
  techStack: "",
  role: "",
  period: "",
  githubUrl: "",
  demoUrl: "",
  imageUrl: "",
  isFeatured: false,
};

/** "React, Supabase" 같은 쉼표 문자열을 중복 없는 배열로 바꾼다. */
export function parseTechStack(text) {
  return [...new Set(text.split(",").map(item => item.trim()).filter(Boolean))];
}

/** 저장된 프로젝트를 수정 폼의 초기값으로 바꾼다. */
export function toFormValues(project) {
  const values = { ...EMPTY_PROJECT_FORM };
  Object.keys(values).forEach(key => {
    if (project[key] !== undefined && project[key] !== null) values[key] = project[key];
  });
  values.techStack = (project.techStack ?? []).join(", ");
  return values;
}

/** 폼 값을 앞뒤 공백을 지운 저장용 프로젝트 객체로 바꾼다. */
export function toProjectInput(values) {
  const trimmed = Object.fromEntries(
    Object.entries(values).map(([key, value]) => [key, typeof value === "string" ? value.trim() : value]),
  );
  return { ...trimmed, techStack: parseTechStack(values.techStack) };
}

/** 프로젝트 폼을 검사해 { 필드명: i18n key } 오류 객체를 돌려준다. */
export function validateProjectForm(values) {
  const errors = {};
  const title = values.title.trim();
  const summary = values.summary.trim();

  if (!title) errors.title = "validation.titleRequired";
  else if (title.length > TITLE_MAX) errors.title = "validation.titleTooLong";
  if (!summary) errors.summary = "validation.summaryRequired";
  else if (summary.length > SUMMARY_MAX) errors.summary = "validation.summaryTooLong";
  if (!values.description.trim()) errors.description = "validation.descriptionRequired";
  if (!CATEGORIES.includes(values.category)) errors.category = "validation.categoryRequired";
  ["githubUrl", "demoUrl"].forEach(field => {
    if (!isOptionalUrl(values[field])) errors[field] = "validation.urlInvalid";
  });
  if (!isOptionalImageUrl(values.imageUrl)) errors.imageUrl = "validation.imageUrlInvalid";
  return errors;
}
