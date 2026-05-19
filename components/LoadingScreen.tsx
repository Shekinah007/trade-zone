"use client";

import { useEffect, useState } from "react";

export default function LoadingScreen() {
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Start fade-out after a short hold
    const holdTimer = setTimeout(() => setFadeOut(true), 800);
    // Unmount after fade-out completes
    const removeTimer = setTimeout(() => setVisible(false), 1400); // 800 hold + 600 fade

    return () => {
      clearTimeout(holdTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      style={{
        opacity: fadeOut ? 0 : 1,
        transition: "opacity 0.6s ease",
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-white dark:bg-black"
    >
      {/* Your loader UI — swap this out for your own */}
      <div className="flex flex-col items-center gap-3">
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-2 h-2 rounded-full bg-gray-400 animate-pulse"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
        <p className="text-sm text-gray-400">Loading…</p>
      </div>
    </div>
  );
}
