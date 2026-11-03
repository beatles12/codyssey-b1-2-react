const GITHUB_URL = "https://github.com/beatles12";

function Footer() {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer className="footer">
      <p>© 2026 Portfolio</p>
      <p>
        Planning · AI · Development ·{" "}
        <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
          GitHub ↗
        </a>
      </p>
      <button className="footer-top" type="button" onClick={scrollToTop}>
        Back to top ↑
      </button>
    </footer>
  );
}

export default Footer;
