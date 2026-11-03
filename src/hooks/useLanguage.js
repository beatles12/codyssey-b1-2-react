import { useContext } from "react";
import { LanguageContext } from "../contexts/LanguageContext.jsx";

/** 언어 정보({ language, t, messages, toggleLanguage })를 꺼내 쓴다. */
function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage는 LanguageProvider 안에서만 사용할 수 있습니다.");
  return context;
}

export default useLanguage;
