import { useContext } from "react";
import { ThemeContext } from "../contexts/ThemeContext.jsx";

/** 테마 정보({ mode, theme, toggleTheme, selectAutoTheme })를 꺼내 쓴다. */
function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme은 ThemeProvider 안에서만 사용할 수 있습니다.");
  return context;
}

export default useTheme;
