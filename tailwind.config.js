/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: [
          "Open Sans",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
        mono: [
          "JetBrains Mono",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-up": {
          from: { transform: "translateY(10px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        "slide-down": {
          from: { transform: "translateY(-10px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        "scale-in": {
          from: { transform: "scale(0.95)", opacity: "0" },
          to: { transform: "scale(1)", opacity: "1" },
        },
        "pulse-slow": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        "shimmer": {
          from: { backgroundPosition: "-1000px 0" },
          to: { backgroundPosition: "1000px 0" },
        },
        "modal-fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "modal-fade-out": {
          from: { opacity: "1" },
          to: { opacity: "0" },
        },
        "modal-scale-in": {
          from: { transform: "scale(0.95)", opacity: "0" },
          to: { transform: "scale(1)", opacity: "1" },
        },
        "modal-scale-out": {
          from: { transform: "scale(1)", opacity: "1" },
          to: { transform: "scale(0.95)", opacity: "0" },
        },
        "modal-slide-in": {
          from: { transform: "translate(-50%, -48%)", opacity: "0" },
          to: { transform: "translate(-50%, -50%)", opacity: "1" },
        },
        "modal-slide-out": {
          from: { transform: "translate(-50%, -50%)", opacity: "1" },
          to: { transform: "translate(-50%, -48%)", opacity: "0" },
        },
        "modal-content-in": {
          "0%": { 
            transform: "translate(-50%, -48%) scale(0.95)", 
            opacity: "0" 
          },
          "100%": { 
            transform: "translate(-50%, -50%) scale(1)", 
            opacity: "1" 
          },
        },
        "modal-content-out": {
          "0%": { 
            transform: "translate(-50%, -50%) scale(1)", 
            opacity: "1" 
          },
          "100%": { 
            transform: "translate(-50%, -48%) scale(0.95)", 
            opacity: "0" 
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "slide-up": "slide-up 0.3s ease-out",
        "slide-down": "slide-down 0.3s ease-out",
        "scale-in": "scale-in 0.2s ease-out",
        "pulse-slow": "pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "shimmer": "shimmer 2s infinite linear",
        "modal-fade-in": "modal-fade-in 0.15s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "modal-fade-out": "modal-fade-out 0.15s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "modal-scale-in": "modal-scale-in 0.15s cubic-bezier(0.16, 1, 0.3, 1)",
        "modal-scale-out": "modal-scale-out 0.15s cubic-bezier(0.16, 1, 0.3, 1)",
        "modal-slide-in": "modal-slide-in 0.15s cubic-bezier(0.16, 1, 0.3, 1)",
        "modal-slide-out": "modal-slide-out 0.15s cubic-bezier(0.16, 1, 0.3, 1)",
        "modal-content-in": "modal-content-in 0.15s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "modal-content-out": "modal-content-out 0.15s cubic-bezier(0.16, 1, 0.3, 1) forwards",
      },
    },
  },
  plugins: [],
}
