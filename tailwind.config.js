const svgToDataUri = require("mini-svg-data-uri");

const colors = require("tailwindcss/colors");
const {
  default: flattenColorPalette,
} = require("tailwindcss/lib/util/flattenColorPalette");

/** @type {import('tailwindcss').Config} */
module.exports = {
  future: {
    hoverOnlyWhenSupported: true,
  },
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      animation: {
        revolve: "revolve-side-to-side 1s ease-in-out",
        "car-appear": "car-appear 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "car-idle": "car-idle 2.5s ease-in-out infinite",
        "car-windup": "car-windup 0.15s ease-in forwards",
        "car-launch": "car-launch 0.45s cubic-bezier(0.5, 0, 1, 0.5) forwards",
        "car-disappear": "car-disappear 0.3s ease-in forwards",
        "exhaust-trail": "exhaust-trail 0.45s ease-out forwards",
        "speed-lines": "speed-lines 0.4s ease-out forwards",
        "chevron-pulse": "chevron-pulse 1.2s ease-in-out infinite",
      },
      keyframes: {
        "revolve-side-to-side": {
          from: {
            transform: "rotateY(0deg)",
          },
          to: {
            transform: "rotateY(360deg)",
          },
        },
        "car-appear": {
          "0%": { opacity: "0", transform: "translateY(30px) scale(0.9)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        "car-idle": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-3px)" },
        },
        "car-windup": {
          "0%": { transform: "translateY(0) rotateX(0deg)" },
          "100%": { transform: "translateY(2px) rotateX(8deg)" },
        },
        "car-launch": {
          "0%": { opacity: "1", transform: "translateY(0) scale(1)" },
          "15%": { opacity: "1", transform: "translateY(0) scale(1.15)" },
          "100%": { opacity: "0", transform: "translateY(-150vh) scale(0.8)" },
        },
        "car-disappear": {
          "0%": { opacity: "1", transform: "translateY(0)" },
          "100%": { opacity: "0", transform: "translateY(20px)" },
        },
        "exhaust-trail": {
          "0%": { opacity: "0", height: "0px" },
          "20%": { opacity: "0.8", height: "60px" },
          "100%": { opacity: "0", height: "120px" },
        },
        "speed-lines": {
          "0%": { opacity: "0", transform: "translateY(-20px)" },
          "20%": { opacity: "0.6" },
          "100%": { opacity: "0", transform: "translateY(80px)" },
        },
        "chevron-pulse": {
          "0%, 100%": { opacity: "0.15" },
          "50%": { opacity: "0.9" },
        },
      },
    },
  },
  plugins: [
    addVariablesForColors,
    function ({ matchUtilities, theme }) {
      matchUtilities(
        {
          "bg-grid": (value) => ({
            backgroundImage: `url("${svgToDataUri(
              `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32" fill="none" stroke="${value}"><path d="M0 .5H31.5V32"/></svg>`
            )}")`,
          }),
          "bg-grid-small": (value) => ({
            backgroundImage: `url("${svgToDataUri(
              `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="8" height="8" fill="none" stroke="${value}"><path d="M0 .5H31.5V32"/></svg>`
            )}")`,
          }),
          "bg-dot": (value) => ({
            backgroundImage: `url("${svgToDataUri(
              `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="16" height="16" fill="none"><circle fill="${value}" id="pattern-circle" cx="10" cy="10" r="1.6257413380501518"></circle></svg>`
            )}")`,
          }),
        },
        { values: flattenColorPalette(theme("backgroundColor")), type: "color" }
      );
    },
  ],
};

function addVariablesForColors({ addBase, theme }) {
  let allColors = flattenColorPalette(theme("colors"));
  let newVars = Object.fromEntries(
    Object.entries(allColors).map(([key, val]) => [`--${key}`, val])
  );

  addBase({
    ":root": newVars,
  });
}
