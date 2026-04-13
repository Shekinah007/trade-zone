"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "@/components/ui/sonner";
import { Provider } from "react-redux";
import { store } from "@/redux/store";
import { AppModeProvider } from "@/components/AppModeContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <Provider store={store}>
        <AppModeProvider>
          {children}
        </AppModeProvider>
      </Provider>
      <Toaster />
    </SessionProvider>
  );
}
