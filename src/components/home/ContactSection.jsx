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
        <svg className="contact-botanical" viewBox="0 0 240 320" aria-hidden="true">
          <path d="M111 311C120 242 127 184 153 118C168 80 190 48 215 22" />
          <path d="M134 186C97 164 72 137 57 103" />
          <ellipse cx="201" cy="48" rx="19" ry="47" transform="rotate(38 201 48)" />
          <ellipse cx="74" cy="124" rx="18" ry="42" transform="rotate(-45 74 124)" />
          <ellipse cx="163" cy="125" rx="17" ry="40" transform="rotate(41 163 125)" />
        </svg>
      </div>
    </section>
  );
}

export default ContactSection;
