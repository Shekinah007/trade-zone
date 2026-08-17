"use client";

import { useEffect } from "react";

export default function PwaRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      const register = async () => {
        try {
          const registration = await navigator.serviceWorker.register("/sw.js", {
            scope: "/",
          });
          if (registration.waiting) {
            registration.waiting.postMessage({ type: "SKIP_WAITING" });
          }
        } catch (error) {
          console.error("Service worker registration failed:", error);
        }
      };

      // Wait for the page to fully load before registering
      if (document.readyState === "complete") {
        register();
      } else {
        window.addEventListener("load", register);
      }
      return () => window.removeEventListener("load", register);
    }
  }, []);

  return null;
}