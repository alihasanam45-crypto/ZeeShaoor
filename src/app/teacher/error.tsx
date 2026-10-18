"use client";

import { useEffect } from "react";

export default function TeacherError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Teacher workspace error:", error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0a14",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: 440,
          width: "100%",
          background: "#13131f",
          borderRadius: 16,
          border: "1px solid rgba(255,255,255,0.06)",
          padding: "40px 32px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: "rgba(239,68,68,0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
            fontSize: 24,
          }}
        >
          ⚠
        </div>

        <h1
          style={{
            fontSize: 20,
            fontWeight: 700,
            color: "#FFFFFF",
            marginBottom: 8,
          }}
        >
          Something went wrong
        </h1>

        <p
          style={{
            fontSize: 14,
            color: "rgba(255,255,255,0.55)",
            lineHeight: 1.5,
            marginBottom: 28,
          }}
        >
          An unexpected error occurred in the teacher workspace.
          {error.digest && (
            <>
              <br />
              Error ID: <code style={{ fontSize: 12 }}>{error.digest}</code>
            </>
          )}
        </p>

        <button
          onClick={reset}
          style={{
            padding: "10px 28px",
            borderRadius: 10,
            border: "none",
            background: "linear-gradient(135deg, #2563eb, #7c3aed)",
            color: "#FFFFFF",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            transition: "opacity 0.2s",
          }}
          onMouseOver={(e) => (e.currentTarget.style.opacity = "0.85")}
          onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
