import { useState } from "react";
import Button from "../ui/Button.jsx";
import FormField from "../ui/FormField.jsx";
import useLanguage from "../../hooks/useLanguage.js";
import { sendContactMessage } from "../../lib/contactApi.js";
import { hasErrors, validateContact } from "../../lib/validators.js";

const EMPTY_CONTACT = { name: "", email: "", message: "" };

/** 이름·이메일·메시지를 검사한 뒤 전송하는 문의 폼. 전송 상태(status)에 따라 안내 문구가 바뀐다. */
function ContactForm() {
  const { t } = useLanguage();
  const [values, setValues] = useState(EMPTY_CONTACT);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle");

  const handleChange = event => {
    const { name, value } = event.target;
    const nextValues = { ...values, [name]: value };
    setValues(nextValues);
    if (errors[name]) setErrors(validateContact(nextValues));
  };

  const handleSubmit = async event => {
    event.preventDefault();
    const nextErrors = validateContact(values);
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) return;

    setStatus("sending");
    try {
      await sendContactMessage(values);
      setValues(EMPTY_CONTACT);
      setStatus("success");
    } catch {
      setStatus("failure");
    }
  };

  return (
    <form className="contact-form" noValidate onSubmit={handleSubmit}>
      <div className="contact-row">
        <FormField label={t("contact.name")} name="name" value={values.name} onChange={handleChange} error={t(errors.name)} />
        <FormField label={t("contact.email")} name="email" type="email" value={values.email} onChange={handleChange} error={t(errors.email)} />
      </div>
      <FormField label={t("contact.message")} name="message" as="textarea" value={values.message} onChange={handleChange} error={t(errors.message)} />
      <p className={`form-status form-status-${status}`} role="status">
        {status !== "idle" && t(`contact.${status}`)}
      </p>
      <Button variant="primary" type="submit" icon="→" isLoading={status === "sending"} loadingText={t("contact.sending")}>
        {t("contact.submit")}
      </Button>
    </form>
  );
}

export default ContactForm;
