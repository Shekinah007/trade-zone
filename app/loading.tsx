"use client";

import { useEffect, useState } from "react";

export default function LoadingScreen({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const loadingTimer = setTimeout(() => {
      setLoading(false);

      setTimeout(() => {
        setShowContent(true);
      }, 150);
    }, 1800);

    return () => clearTimeout(loadingTimer);
  }, []);

  return (
    <>
      {/* Loading Screen */}
      <div
        className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-white transition-all duration-700 ${
          loading
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Animated Rings */}
        <div className="relative flex items-center justify-center">
          <div className="h-24 w-24 animate-spin rounded-full border-[6px] border-red-200 border-t-red-500" />

          <div className="absolute h-16 w-16 animate-spin rounded-full border-[6px] border-green-200 border-b-green-500 [animation-direction:reverse]" />

          <div className="absolute h-6 w-6 rounded-full bg-gradient-to-br from-green-500 to-red-500 shadow-lg" />
        </div>

        {/* Brand / Loading Text */}
        <div className="mt-8 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-gray-800">
            Loading...
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Please wait while we prepare your experience
          </p>
        </div>

        {/* Animated Dots */}
        <div className="mt-5 flex items-center gap-2">
          <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-green-500 [animation-delay:-0.3s]" />
          <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-red-500 [animation-delay:-0.15s]" />
          <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-green-500" />
        </div>

        {/* Bottom Glow */}
        <div className="absolute bottom-0 left-0 h-40 w-full bg-gradient-to-t from-green-50 via-red-50 to-transparent" />
      </div>

      {/* Page Content */}
      <div
        className={`transition-all duration-700 ${
          showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        {children}
      </div>
    </>
  );
}
