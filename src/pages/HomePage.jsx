import AboutSection from "../components/home/AboutSection.jsx";
import ContactSection from "../components/home/ContactSection.jsx";
import ExpertiseSection from "../components/home/ExpertiseSection.jsx";
import FeaturedProjects from "../components/home/FeaturedProjects.jsx";
import GithubRepoList from "../components/project/GithubRepoList.jsx";
import HeroSection from "../components/home/HeroSection.jsx";
import WorkSection from "../components/home/WorkSection.jsx";

/** "/" 홈 화면. B1-1과 같은 순서로 Hero → About → Expertise → Work → Contact를 보여준다. */
function HomePage() {
  return (
    <>
      <HeroSection />
      <AboutSection number="02" />
      <ExpertiseSection number="03" />
      <WorkSection number="04">
        <FeaturedProjects />
        <GithubRepoList />
      </WorkSection>
      <ContactSection number="05" />
    </>
  );
}

export default HomePage;
