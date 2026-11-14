/**
 * Design Tokens & Theme — GearLoop Design System (E0-F3-T1)
 * Định nghĩa chuẩn màu sắc, typography, spacing, border-radius và semantic tokens.
 * Được ánh xạ 1:1 với Tailwind CSS v4 và biến CSS trong globals.css.
 */

export const tokens = {
  colors: {
    // Brand Palette
    brand: {
      50: "#ecfdf5",
      100: "#d1fae5",
      200: "#a7f3d0",
      500: "#10b981",
      600: "#059669", // Primary main
      700: "#047857", // Primary hover
      800: "#065f46",
    },
    // Neutrals (Slate)
    neutral: {
      50: "#f8fafc",
      100: "#f1f5f9",
      200: "#e2e8f0",
      300: "#cbd5e1",
      400: "#94a3b8",
      500: "#64748b",
      600: "#475569",
      700: "#334155",
      800: "#1e293b",
      900: "#0f172a",
    },
    // Semantic Status Tokens
    status: {
      success: {
        text: "text-emerald-800",
        bg: "bg-emerald-50",
        border: "border-emerald-200",
      },
      warning: {
        text: "text-amber-800",
        bg: "bg-amber-50",
        border: "border-amber-200",
      },
      danger: {
        text: "text-red-700",
        bg: "bg-red-50",
        border: "border-red-200",
      },
      info: {
        text: "text-blue-700",
        bg: "bg-blue-50",
        border: "border-blue-200",
      },
    },
  },
  typography: {
    fontSans:
      'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  spacing: {
    container: "max-w-6xl mx-auto px-4 sm:px-6",
    section: "py-8 sm:py-12",
  },
  radii: {
    sm: "rounded-md",
    md: "rounded-lg",
    lg: "rounded-xl",
    full: "rounded-full",
  },
  shadows: {
    sm: "shadow-2xs",
    md: "shadow-xs",
    lg: "shadow-md",
  },
} as const;

export type ThemeTokens = typeof tokens;
