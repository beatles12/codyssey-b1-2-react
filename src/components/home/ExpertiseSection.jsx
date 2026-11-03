import RevealSection from "../ui/RevealSection.jsx";
import SectionHeading from "../ui/SectionHeading.jsx";
import useLanguage from "../../hooks/useLanguage.js";

/** 네 가지 역량 카드(Planning·AI·Development·Communication)를 보여준다. */
function ExpertiseSection({ number }) {
  const { expertise } = useLanguage().messages;

  return (
    <RevealSection id="expertise" className="skills">
      <SectionHeading number={number} eyebrow={expertise.eyebrow} title={expertise.title} as="h2" isTyping />
      <div className="skill-grid">
        {expertise.items.map((item, index) => (
          <article key={item.title} className="skill-card">
            <span>{String(index + 1).padStart(2, "0")}</span>
            <div className="skill-icon" aria-hidden="true">
              {item.icon}
            </div>
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </article>
        ))}
      </div>
    </RevealSection>
  );
}

export default ExpertiseSection;
