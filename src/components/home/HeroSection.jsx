import Button from "../ui/Button.jsx";
import TypingHeading from "../ui/TypingHeading.jsx";
import useLanguage from "../../hooks/useLanguage.js";

/** 첫 화면: 타이핑되는 대표 문구와 Current Focus·Build Loop 카드. */
function HeroSection() {
  const { hero } = useLanguage().messages;

  return (
    <section className="hero">
      <div className="hero-copy">
        <p className="eyebrow">{hero.eyebrow}</p>
        <TypingHeading as="h1" text={hero.title} startDelay={550} />
        <p className="hero-description">{hero.description}</p>
        <Button to="/projects" icon="→">
          {hero.cta}
        </Button>
      </div>

      <div className="hero-stage">
        <article className="focus-card">
          <div className="card-top">
            <span>{hero.focusLabel}</span>
            <span>01</span>
          </div>
          <h2>{hero.focusTitle}</h2>
          <p>{hero.focusMeta}</p>
          <div className="focus-tags">
            {hero.focusTags.map(tag => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        </article>
        <article className="loop-card">
          <p>{hero.loopLabel}</p>
          <ol>
            {hero.loopSteps.map((step, index) => (
              <li key={step}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                {step}
              </li>
            ))}
          </ol>
        </article>
      </div>
    </section>
  );
}

export default HeroSection;
