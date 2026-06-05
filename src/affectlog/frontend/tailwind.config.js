/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    screens: {
      xs:  "480px",
      sm:  "640px",
      md:  "768px",
      lg:  "1024px",
      xl:  "1280px",
      "2xl": "1536px",
    },
    extend: {
      colors: {
        // ── Legacy navy (backward-compat) ──────────────────────
        navy: {
          950: "#030712",
          900: "#050c1a",
          800: "#0a1628",
          700: "#0f2040",
          600: "#152952",
        },
        // ── Spec background tokens ─────────────────────────────
        bg: {
          950: "#050814",
          900: "#080D1F",
          850: "#0C1328",
          800: "#111A33",
        },
        // ── Surface tokens ─────────────────────────────────────
        surface: {
          950: "#0a0f1e",
          900: "#0B1020",
          800: "#111827",
          700: "#172033",
          600: "#334155",
          0:   "#ffffff",
          50:  "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
        },
        // ── Brand accents ──────────────────────────────────────
        "affectlog-blue":          "#2563EB",
        "electric-cyan":           "#22D3EE",
        "explainability-violet":   "#8B5CF6",
        "privacy-green":           "#10B981",
        "compliance-indigo":       "#6366F1",
        // ── Standard palette extensions ────────────────────────
        cyan: {
          400: "#22d3ee",
          500: "#06b6d4",
          600: "#0891b2",
          700: "#0e7490",
        },
        violet: {
          400: "#a78bfa",
          500: "#8b5cf6",
          600: "#7c3aed",
          700: "#6d28d9",
        },
        emerald: {
          400: "#34d399",
          500: "#10b981",
          600: "#059669",
        },
        amber: {
          400: "#fbbf24",
          500: "#f59e0b",
        },
        red: {
          400: "#f87171",
          500: "#ef4444",
          600: "#dc2626",
        },
        indigo: {
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
        },
      },
      fontFamily: {
        sans: [
          "InterVariable", "Inter", "ui-sans-serif", "system-ui",
          "-apple-system", "BlinkMacSystemFont", '"Segoe UI"', "sans-serif",
        ],
        mono: [
          '"JetBrains Mono"', '"IBM Plex Mono"', '"Fira Code"',
          '"Cascadia Code"', "ui-monospace", "monospace",
        ],
      },
      // ── Premium typographic scale (spec-exact) ────────────────
      fontSize: {
        "display-xl": ["5rem",    { lineHeight: "5.5rem",  letterSpacing: "-0.04em",  fontWeight: "700" }],
        "display-lg": ["4rem",    { lineHeight: "4.5rem",  letterSpacing: "-0.035em", fontWeight: "700" }],
        "h1":         ["3.5rem",  { lineHeight: "4rem",    letterSpacing: "-0.03em",  fontWeight: "700" }],
        "h2":         ["2.75rem", { lineHeight: "3.25rem", letterSpacing: "-0.025em", fontWeight: "600" }],
        "h3":         ["2rem",    { lineHeight: "2.5rem",  letterSpacing: "-0.02em",  fontWeight: "600" }],
        "h4":         ["1.5rem",  { lineHeight: "2rem",    letterSpacing: "-0.01em",  fontWeight: "600" }],
        "body-lg":    ["1.125rem",{ lineHeight: "1.875rem", fontWeight: "400" }],
        "body":       ["1rem",    { lineHeight: "1.625rem", fontWeight: "400" }],
        "small":      ["0.875rem",{ lineHeight: "1.375rem", fontWeight: "400" }],
        "caption":    ["0.75rem", { lineHeight: "1.125rem", fontWeight: "400" }],
      },
      animation: {
        "glow-pulse":    "pulseGlow 2.5s ease-in-out infinite",
        "float":         "float 4s ease-in-out infinite",
        "fade-in":       "fadeIn 0.4s ease-out",
        "slide-up":      "slideUp 0.4s ease-out",
        "slide-in-left": "slideInLeft 0.5s ease-out",
        "beam-flow":     "beamFlow 2s linear infinite",
        "node-pulse":    "nodePulse 2s ease-in-out infinite",
        "draw-line":     "drawLine 1.5s ease-out forwards",
        "shimmer":       "shimmer 2.5s linear infinite",
        "spin-slow":     "spin 8s linear infinite",
        "ping-slow":     "ping 3s cubic-bezier(0,0,0.2,1) infinite",
        "count-up":      "countUp 0.8s ease-out",
      },
      keyframes: {
        fadeIn:      { "0%": { opacity: "0" },                               "100%": { opacity: "1" } },
        slideUp:     { "0%": { opacity: "0", transform: "translateY(16px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        slideInLeft: { "0%": { opacity: "0", transform: "translateX(-20px)" },"100%": { opacity: "1", transform: "translateX(0)" } },
        pulseGlow:   { "0%, 100%": { opacity: "0.5" }, "50%": { opacity: "1" } },
        float:       { "0%, 100%": { transform: "translateY(0)" },            "50%": { transform: "translateY(-8px)" } },
        beamFlow: {
          "0%":   { strokeDashoffset: "200" },
          "100%": { strokeDashoffset: "0" },
        },
        nodePulse: {
          "0%, 100%": { opacity: "0.6", transform: "scale(1)" },
          "50%":       { opacity: "1",   transform: "scale(1.1)" },
        },
        drawLine: {
          "0%":   { strokeDashoffset: "400" },
          "100%": { strokeDashoffset: "0" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-400% center" },
          "100%": { backgroundPosition: "400% center" },
        },
        countUp: {
          "0%":   { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      backgroundImage: {
        // Grid overlays
        "grid-subtle": "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
        "grid-dark":   "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
        // Spec hero orb
        "hero-orb": "radial-gradient(circle at 30% 20%, rgba(34,211,238,.30), transparent 28%), radial-gradient(circle at 80% 10%, rgba(139,92,246,.22), transparent 30%), linear-gradient(180deg, #050814 0%, #080D1F 55%, #0B1020 100%)",
        // Trust gradients
        "trust-gradient":      "linear-gradient(135deg, #2563EB 0%, #22D3EE 50%, #8B5CF6 100%)",
        "privacy-gradient":    "linear-gradient(135deg, #10B981 0%, #22D3EE 100%)",
        "compliance-gradient": "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)",
        // Shimmer sweep
        "shimmer-sweep": "linear-gradient(105deg, transparent 33%, rgba(255,255,255,0.07) 50%, transparent 67%)",
      },
      backgroundSize: {
        "grid":    "64px 64px",
        "grid-sm": "32px 32px",
        "shimmer": "400% 100%",
      },
      boxShadow: {
        "glow-cyan":    "0 0 32px rgba(34,211,238,0.15), 0 0 64px rgba(34,211,238,0.06)",
        "glow-violet":  "0 0 32px rgba(139,92,246,0.15), 0 0 64px rgba(139,92,246,0.06)",
        "glow-blue":    "0 0 32px rgba(37,99,235,0.20),  0 0 64px rgba(37,99,235,0.08)",
        "glow-green":   "0 0 32px rgba(16,185,129,0.15), 0 0 64px rgba(16,185,129,0.06)",
        "card":         "0 4px 12px rgba(0,0,0,0.4), 0 2px 4px rgba(0,0,0,0.3)",
        "card-lg":      "0 8px 24px rgba(0,0,0,0.5), 0 4px 8px rgba(0,0,0,0.3)",
        "card-xl":      "0 16px 48px rgba(0,0,0,0.6), 0 8px 16px rgba(0,0,0,0.4)",
        "header":       "0 1px 0 rgba(255,255,255,0.05), 0 4px 24px rgba(0,0,0,0.35)",
        "btn-primary":  "0 4px 14px rgba(37,99,235,0.30),  0 2px 6px rgba(37,99,235,0.20)",
        "btn-cyan":     "0 4px 14px rgba(34,211,238,0.25), 0 2px 6px rgba(34,211,238,0.15)",
        "btn-violet":   "0 4px 14px rgba(139,92,246,0.25), 0 2px 6px rgba(139,92,246,0.15)",
        "btn-green":    "0 4px 14px rgba(16,185,129,0.25), 0 2px 6px rgba(16,185,129,0.15)",
      },
      spacing: {
        "18": "4.5rem",
        "22": "5.5rem",
        "26": "6.5rem",
        "30": "7.5rem",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      maxWidth: {
        "content":  "760px",
        "section":  "1200px",
        "wide":     "1280px",
        "full-hd":  "1440px",
      },
      transitionTimingFunction: {
        "out-expo":    "cubic-bezier(0.16, 1, 0.3, 1)",
        "in-out-expo": "cubic-bezier(0.87, 0, 0.13, 1)",
      },
    },
  },
  plugins: [],
};
