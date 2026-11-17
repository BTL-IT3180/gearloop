/** Storefront tokens for GearLoop E0-F3. CSS custom properties live in globals.css. */
export const tokens = {
  colors: {
    brand: {
      50: "#fff3df",
      100: "#ffe6bc",
      200: "#f8cf91",
      500: "#f2ae51",
      600: "#e99832",
      700: "#d7811b",
      800: "#9e5c13",
    },
    neutral: {
      50: "#f2f4f5",
      100: "#edf0ed",
      200: "#dce2e5",
      300: "#bbc8cc",
      400: "#8fa4b3",
      500: "#62737c",
      600: "#465f6b",
      700: "#23384c",
      800: "#192c37",
      900: "#142333",
    },
    status: {
      success: {
        text: "text-[#28634f]",
        bg: "bg-[#edf4ef]",
        border: "border-[#ccdbd1]",
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
  typography: { fontSans: 'var(--font-vietnamese), "Segoe UI", sans-serif' },
  spacing: { container: "page-width", section: "py-8 sm:py-12" },
  radii: {
    sm: "rounded",
    md: "rounded-md",
    lg: "rounded-lg",
    full: "rounded-full",
  },
  shadows: { sm: "shadow-2xs", md: "shadow-xs", lg: "shadow-md" },
} as const;
export type ThemeTokens = typeof tokens;
