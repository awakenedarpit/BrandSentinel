/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "surface": "#f9f9ff",
        "surface-dim": "#cedaf8",
        "surface-bright": "#f9f9ff",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f1f3ff",
        "surface-container": "#e8eeff",
        "surface-container-high": "#e0e8ff",
        "surface-container-highest": "#d7e2ff",
        "on-surface": "#0f1b31",
        "on-surface-variant": "#484556",
        "inverse-surface": "#243047",
        "inverse-on-surface": "#ecf0ff",
        "outline": "#787587",
        "outline-variant": "#c9c4d8",
        "surface-tint": "#5c3aeb",
        "primary": "#4003d1",
        "on-primary": "#ffffff",
        "primary-container": "#5936e8",
        "on-primary-container": "#d6ceff",
        "inverse-primary": "#c8bfff",
        "secondary": "#004ddf",
        "on-secondary": "#ffffff",
        "secondary-container": "#3168fc",
        "on-secondary-container": "#fffbff",
        "tertiary": "#3a4361",
        "on-tertiary": "#ffffff",
        "tertiary-container": "#515b79",
        "on-tertiary-container": "#cad3f7",
        "error": "#ba1a1a",
        "on-error": "#ffffff",
        "error-container": "#ffdad6",
        "on-error-container": "#93000a",
        "primary-fixed": "#e5deff",
        "primary-fixed-dim": "#c8bfff",
        "on-primary-fixed": "#1a0064",
        "on-primary-fixed-variant": "#430dd4",
        "secondary-fixed": "#dce1ff",
        "secondary-fixed-dim": "#b6c4ff",
        "on-secondary-fixed": "#00164e",
        "on-secondary-fixed-variant": "#003baf",
        "tertiary-fixed": "#dbe1ff",
        "tertiary-fixed-dim": "#bcc5e9",
        "on-tertiary-fixed": "#101a35",
        "on-tertiary-fixed-variant": "#3c4663",
        "background": "#f9f9ff",
        "on-background": "#0f1b31",
        "surface-variant": "#d7e2ff"
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        sm: "0.25rem",
        md: "0.5rem",
        lg: "0.5rem",
        xl: "0.75rem",
        "2xl": "1rem",
        full: "9999px"
      },
      spacing: {
        "space-xs": "0.25rem",
        "space-sm": "0.5rem",
        "space-md": "1rem",
        "space-lg": "1.5rem",
        "space-xl": "2rem",
        gutter: "1.5rem",
        margin: "2rem"
      },
      fontFamily: {
        "display-hero": ["Inter", "sans-serif"],
        "headline-lg": ["Inter", "sans-serif"],
        "headline-md": ["Inter", "sans-serif"],
        "headline-sm": ["Inter", "sans-serif"],
        "body-lg": ["Inter", "sans-serif"],
        "body-md": ["Inter", "sans-serif"],
        "body-sm": ["Inter", "sans-serif"],
        "label-meta": ["Inter", "sans-serif"],
        "label-code": ["JetBrains Mono", "monospace"]
      },
      fontSize: {
        "headline-sm": ["18px", { lineHeight: "24px", letterSpacing: "-0.015em", fontWeight: "600" }],
        "label-meta": ["11px", { lineHeight: "14px", letterSpacing: "0.06em", fontWeight: "600" }],
        "body-sm": ["12px", { lineHeight: "16px", letterSpacing: "0em", fontWeight: "400" }],
        "headline-md": ["22px", { lineHeight: "28px", letterSpacing: "-0.02em", fontWeight: "600" }],
        "body-md": ["14px", { lineHeight: "20px", letterSpacing: "0em", fontWeight: "400" }],
        "headline-lg": ["30px", { lineHeight: "38px", letterSpacing: "-0.025em", fontWeight: "600" }],
        "body-lg": ["16px", { lineHeight: "24px", letterSpacing: "-0.01em", fontWeight: "400" }],
        "display-hero": ["40px", { lineHeight: "48px", letterSpacing: "-0.03em", fontWeight: "700" }],
        "label-code": ["11px", { lineHeight: "14px", letterSpacing: "0.04em", fontWeight: "500" }]
      }
    }
  },
  plugins: []
}
