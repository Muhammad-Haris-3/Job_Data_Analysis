"use client";

import { createContext, useContext, useState } from "react";

const darkPalette = {
  BG: "#0a0f1a",
  CARD: "#0e1623",
  BORDER: "#1a2535",
  CYAN: "#00e5ff",
  MUTED: "#4a6080",
  TEXT: "#e2eaf4",
  GREEN: "#00e676",
  RED: "#ff6b6b",
  TOOLTIP_BG: "#111d2e",
  CARD_HOVER: "#111e30",
  SUBTLE_BG: "#0a1220",
  SECONDARY_TEXT: "#b0bec5",
  ACCENT_GREEN: "#00e676",
  ACCENT_RED: "#ff6b6b",
  ACCENT_PURPLE: "#ce93d8",
  ACCENT_YELLOW: "#ffd54f",
};

const lightPalette = {
  BG: "#f0f4f8",
  CARD: "#ffffff",
  BORDER: "#d0d9e3",
  CYAN: "#0097a7",
  MUTED: "#6b7e94",
  TEXT: "#1a2535",
  GREEN: "#009e52",
  RED: "#d32f2f",
  TOOLTIP_BG: "#ffffff",
  CARD_HOVER: "#e8f0f8",
  SUBTLE_BG: "#edf2f7",
  SECONDARY_TEXT: "#546e7a",
  ACCENT_GREEN: "#2e7d32",
  ACCENT_RED: "#c62828",
  ACCENT_PURPLE: "#7b1fa2",
  ACCENT_YELLOW: "#f9a825",
};

const ThemeContext = createContext({
  dark: true,
  setDark: () => {},
  theme: darkPalette,
});

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(true);
  const theme = dark ? darkPalette : lightPalette;

  return (
    <ThemeContext.Provider value={{ dark, setDark, theme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
