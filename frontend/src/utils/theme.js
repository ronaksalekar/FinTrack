export const THEME_STORAGE_KEY = "preferredTheme";

const VALID_THEMES = new Set(["light", "dark", "auto"]);

const getSystemTheme = () => {
  if (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    return "dark";
  }

  return "light";
};

export const sanitizeTheme = (theme) => (VALID_THEMES.has(theme) ? theme : "light");

export const getStoredThemePreference = () => {
  if (typeof window === "undefined") return "light";
  return sanitizeTheme(localStorage.getItem(THEME_STORAGE_KEY));
};

export const persistThemePreference = (theme) => {
  if (typeof window === "undefined") return;
  const sanitizedTheme = sanitizeTheme(theme);
  localStorage.setItem(THEME_STORAGE_KEY, sanitizedTheme);
};

export const resolveTheme = (themePreference) => {
  const sanitizedTheme = sanitizeTheme(themePreference);
  return sanitizedTheme === "auto" ? getSystemTheme() : sanitizedTheme;
};

export const applyTheme = (themePreference) => {
  if (typeof document === "undefined") return () => {};

  const sanitizedTheme = sanitizeTheme(themePreference);
  const root = document.documentElement;
  const mediaQuery =
    typeof window !== "undefined" && typeof window.matchMedia === "function"
      ? window.matchMedia("(prefers-color-scheme: dark)")
      : null;

  const updateTheme = () => {
    const activeTheme = sanitizedTheme === "auto" ? getSystemTheme() : sanitizedTheme;
    root.setAttribute("data-theme", activeTheme);
    root.style.colorScheme = activeTheme;
  };

  updateTheme();

  if (sanitizedTheme !== "auto" || !mediaQuery) {
    return () => {};
  }

  const handleSystemThemeChange = () => updateTheme();

  if (typeof mediaQuery.addEventListener === "function") {
    mediaQuery.addEventListener("change", handleSystemThemeChange);
    return () => mediaQuery.removeEventListener("change", handleSystemThemeChange);
  }

  mediaQuery.addListener(handleSystemThemeChange);
  return () => mediaQuery.removeListener(handleSystemThemeChange);
};
