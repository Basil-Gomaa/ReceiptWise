import React, { createContext, useState, useContext, useEffect } from "react";
import { useDarkMode } from "@/hooks/useDarkMode";

// Define context types
type ThemeContextType = {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
};

// Create context with default values
const ThemeContext = createContext<ThemeContextType>({
  isDarkMode: false,
  toggleDarkMode: () => {},
});

// Theme provider component
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Custom hook to use the theme context
export const useTheme = () => useContext(ThemeContext);
