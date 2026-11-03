import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { readStorage, writeStorage } from "../lib/storage.js";

const STORAGE_KEY = "portfolio-theme-mode";
const DARK_QUERY = "(prefers-color-scheme: dark)";

export const ThemeContext = createContext(null);

/** 저장된 테마 모드를 읽는다. 사용자가 고른 적이 없으면 "auto". */
function readSavedMode() {
  const saved = readStorage(STORAGE_KEY);
  return saved === "light" || saved === "dark" ? saved : "auto";
}

/** 운영체제의 현재 테마("light" | "dark")를 읽는다. */
function readSystemTheme() {
  return window.matchMedia(DARK_QUERY).matches ? "dark" : "light";
}

/** Light / Dark / Auto 테마를 앱 전체에 제공한다. */
export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(readSavedMode);
  const [systemTheme, setSystemTheme] = useState(readSystemTheme);
  const theme = mode === "auto" ? systemTheme : mode;

  useEffect(() => {
    const mediaQuery = window.matchMedia(DARK_QUERY);
    const handleChange = event => setSystemTheme(event.matches ? "dark" : "light");

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    writeStorage(STORAGE_KEY, mode === "auto" ? null : mode);
  }, [mode]);

  const toggleTheme = useCallback(() => setMode(theme === "dark" ? "light" : "dark"), [theme]);
  const selectAutoTheme = useCallback(() => setMode("auto"), []);
  const value = useMemo(
    () => ({ mode, theme, toggleTheme, selectAutoTheme }),
    [mode, theme, toggleTheme, selectAutoTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
