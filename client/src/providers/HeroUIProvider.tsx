import React from "react";
import { HeroUIProvider as Provider, HeroUIProviderProps } from "@heroui/react";

export function HeroUIProvider({ children }: { children: React.ReactNode }) {
  return <Provider>{children}</Provider>;
}