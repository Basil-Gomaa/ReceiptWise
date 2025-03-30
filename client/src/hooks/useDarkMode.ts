import { useState, useEffect } from "react";

export function useDarkMode() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check local storage first
    const savedDarkMode = localStorage.getItem("darkMode");
    if (savedDarkMode) {
      return savedDarkMode === "true";
    }
    
    // Otherwise check system preference
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    // Update the document class when dark mode changes
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    
    // Save preference to local storage
    localStorage.setItem("darkMode", String(isDarkMode));
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  return { isDarkMode, toggleDarkMode };
}
