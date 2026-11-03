import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { translate, translations } from "../lib/i18n.js";
import { readStorage, writeStorage } from "../lib/storage.js";

const STORAGE_KEY = "portfolio-language";

export const LanguageContext = createContext(null);

/** 저장된 언어를 읽는다. 기본값은 한국어. */
function readSavedLanguage() {
  return readStorage(STORAGE_KEY) === "en" ? "en" : "ko";
}

/** 현재 언어와 번역 함수 t를 앱 전체에 제공한다. */
export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(readSavedLanguage);

  useEffect(() => {
    document.documentElement.lang = language;
    writeStorage(STORAGE_KEY, language);
  }, [language]);

  const t = useCallback((key, params) => translate(language, key, params), [language]);
  const toggleLanguage = useCallback(() => setLanguage(current => (current === "ko" ? "en" : "ko")), []);
  const value = useMemo(
    () => ({ language, t, messages: translations[language], toggleLanguage }),
    [language, t, toggleLanguage],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}
