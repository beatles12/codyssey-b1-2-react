import useLanguage from "../../hooks/useLanguage.js";
import useTheme from "../../hooks/useTheme.js";

/** 헤더 오른쪽의 언어(KR/EN)·테마(Auto/Light/Dark) 전환 버튼. */
function DisplayControls() {
  const { mode, theme, toggleTheme, selectAutoTheme } = useTheme();
  const { t, toggleLanguage } = useLanguage();
  const isDark = theme === "dark";

  return (
    <>
      <button className="language-toggle" type="button" aria-label={t("settings.languageLabel")} onClick={toggleLanguage}>
        {t("settings.language")}
      </button>
      <button
        className="theme-toggle"
        type="button"
        aria-label={t("settings.autoLabel")}
        aria-pressed={mode === "auto"}
        onClick={selectAutoTheme}
      >
        {t("settings.auto")}
        {mode === "auto" && " ✓"}
      </button>
      <button
        className="theme-toggle"
        type="button"
        aria-label={t(isDark ? "settings.toLightLabel" : "settings.toDarkLabel")}
        onClick={toggleTheme}
      >
        {t(isDark ? "settings.toLight" : "settings.toDark")}
      </button>
    </>
  );
}

export default DisplayControls;
