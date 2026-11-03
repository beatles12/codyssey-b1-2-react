// 입력값 검사 함수 모음. 오류가 있으면 { 필드명: i18n key } 객체를 돌려준다.

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_PATTERN = /^https?:\/\/\S+$/;

/** 이메일 형식인지 검사한다. */
export function isValidEmail(value) {
  return EMAIL_PATTERN.test(value.trim());
}

/** 비어 있거나 http(s):// 주소면 통과한다. */
export function isOptionalUrl(value) {
  return !value.trim() || URL_PATTERN.test(value.trim());
}

/** 문의 폼(name, email, message)을 검사한다. */
export function validateContact({ name, email, message }) {
  const errors = {};
  if (!name.trim()) errors.name = "validation.nameRequired";
  if (!email.trim()) errors.email = "validation.emailRequired";
  else if (!isValidEmail(email)) errors.email = "validation.emailInvalid";
  if (!message.trim()) errors.message = "validation.messageRequired";
  return errors;
}

/** 관리자 로그인 폼(email, password)을 검사한다. */
export function validateLogin({ email, password }) {
  const errors = {};
  if (!email.trim()) errors.email = "validation.emailRequired";
  else if (!isValidEmail(email)) errors.email = "validation.emailInvalid";
  if (!password) errors.password = "validation.passwordRequired";
  return errors;
}

/** 오류 객체에 오류가 하나라도 있는지 확인한다. */
export function hasErrors(errors) {
  return Object.keys(errors).length > 0;
}
