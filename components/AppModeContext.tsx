"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { usePathname } from "next/navigation";

type AppMode = "marketplace" | "registry";

interface AppModeContextType {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
}

const AppModeContext = createContext<AppModeContextType | undefined>(undefined);

export function AppModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<AppMode>("marketplace");
  const pathname = usePathname();

  // Auto-switch mode based on routes
  useEffect(() => {
    if (!pathname) return;

    if (pathname.startsWith("/registry") || pathname.startsWith("/reports")) {
      setMode("registry");
    } else if (
      pathname.startsWith("/browse") ||
      pathname.startsWith("/categories") ||
      pathname.startsWith("/listings") ||
      pathname.startsWith("/saved")
    ) {
      setMode("marketplace");
    }
  }, [pathname]);

  return (
    <AppModeContext.Provider value={{ mode, setMode }}>
      {children}
    </AppModeContext.Provider>
  );
}

export function useAppMode() {
  const context = useContext(AppModeContext);
  if (!context) {
    throw new Error("useAppMode must be used within an AppModeProvider");
  }
  return context;
}
