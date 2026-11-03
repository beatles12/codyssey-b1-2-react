import AboutSection from "../components/home/AboutSection.jsx";
import GithubSection from "../components/home/GithubSection.jsx";
import RevealSection from "../components/ui/RevealSection.jsx";
import SectionHeading from "../components/ui/SectionHeading.jsx";
import useLanguage from "../hooks/useLanguage.js";

/** "/about" 소개 화면: 자기소개, 네 가지 역할(기획·교육·AI·창업), GitHub 기록. */
function AboutPage() {
  const { about } = useLanguage().messages;

  return (
    <>
      <AboutSection headingAs="h1" />
      <RevealSection id="roles" className="skills">
        <SectionHeading eyebrow="ROLES" title={about.rolesTitle} as="h2" />
        <div className="skill-grid">
          {about.roles.map((role, index) => (
            <article key={role.title} className="skill-card">
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{role.title}</h3>
              <p>{role.text}</p>
            </article>
          ))}
        </div>
      </RevealSection>
      <GithubSection />
    </>
  );
}

export default AboutPage;
