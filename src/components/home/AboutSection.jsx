import { useState } from "react";
import RevealSection from "../ui/RevealSection.jsx";
import SectionHeading from "../ui/SectionHeading.jsx";
import useLanguage from "../../hooks/useLanguage.js";

/**
 * 소개 글·프로필 그림·관심 분야를 보여주는 About 섹션. 홈과 About 페이지에서 함께 쓴다.
 * @param {string} [number] 섹션 번호
 * @param {"h1"|"h2"} [headingAs] About 페이지에서는 h1
 */
function AboutSection({ number, headingAs = "h2" }) {
  const { about } = useLanguage().messages;
  const [hasImageError, setHasImageError] = useState(false);

  return (
    <RevealSection id="about" className="about">
      <SectionHeading number={number} eyebrow={about.eyebrow} title={about.title} as={headingAs} isTyping />
      <div className="about-grid">
        <figure className="profile">
          <div className="profile-placeholder" aria-hidden="true">
            <span>S.</span>
            <small>EDITORIAL PORTRAIT</small>
          </div>
          {!hasImageError && <img src="/images/about.png" alt={about.imageAlt} onError={() => setHasImageError(true)} />}
        </figure>
        <article className="about-copy">
          <p className="about-lead">{about.lead}</p>
          {about.paragraphs.map(paragraph => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </article>
        <dl className="about-meta">
          {about.meta.map(item => (
            <div key={item.label}>
              <dt>{item.label}</dt>
              <dd>{item.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </RevealSection>
  );
}

export default AboutSection;
