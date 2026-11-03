import ContactForm from "./ContactForm.jsx";
import TypingHeading from "../ui/TypingHeading.jsx";
import useLanguage from "../../hooks/useLanguage.js";

/** 라벤더 배경 위에 문의 문구와 문의 폼을 보여주는 Contact 섹션. */
function ContactSection({ number }) {
  const { contact } = useLanguage().messages;

  return (
    <section id="contact" className="contact">
      <div className="contact-inner">
        <div className="contact-copy">
          {number && <span>{number}</span>}
          <p>{contact.eyebrow}</p>
          <TypingHeading text={contact.title} />
          <small>{contact.subtitle}</small>
        </div>
        <ContactForm />
      </div>
    </section>
  );
}

export default ContactSection;
