"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global Application Error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div
          style={{
            display: "flex",
            minHeight: "100vh",
            alignItems: "center",
            justifyContent: "center",
            padding: "1.5rem",
            backgroundColor: "#f8fafc",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <div
            style={{
              maxWidth: "28rem",
              width: "100%",
              backgroundColor: "white",
              borderRadius: "1.5rem",
              boxShadow:
                "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              border: "1px solid #f1f5f9",
              padding: "2rem",
              textAlign: "center",
            }}
          >
            <div
              style={{
                margin: "0 auto",
                width: "5rem",
                height: "5rem",
                backgroundColor: "#fee2e2",
                borderRadius: "9999px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "1.5rem",
              }}
            >
              <AlertTriangle
                style={{ width: "2.5rem", height: "2.5rem", color: "#ef4444" }}
              />
            </div>

            <h2
              style={{
                fontSize: "1.5rem",
                fontWeight: "bold",
                color: "#0f172a",
                marginBottom: "0.75rem",
                marginTop: 0,
              }}
            >
              Critical System Error
            </h2>

            <p
              style={{
                color: "#64748b",
                marginBottom: "2rem",
                fontSize: "0.875rem",
                lineHeight: 1.6,
              }}
            >
              A critical error occurred while loading the application shell.
              Please try refreshing the page.
            </p>

            <button
              onClick={() => window.location.reload()}
              style={{
                borderRadius: "9999px",
                padding: "0.75rem 2rem",
                backgroundColor: "#dc2626",
                color: "white",
                border: "none",
                fontWeight: 500,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto",
                gap: "0.5rem",
                boxShadow: "0 4px 6px -1px rgba(220, 38, 38, 0.3)",
              }}
            >
              <RefreshCcw size={16} />
              Refresh Page
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
