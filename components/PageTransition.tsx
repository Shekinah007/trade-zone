"use client";

import { useEffect, useState } from "react";

export default function PageTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  const [contentVisible, setContentVisible] = useState(false);

  useEffect(() => {
    // Content fades in as loader fades out (at ~800ms)
    const timer = setTimeout(() => setContentVisible(true), 900);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      style={{
        opacity: contentVisible ? 1 : 0,
        transition: "opacity 0.6s ease",
      }}
    >
      {children}
    </div>
  );
}
