import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

export default defineConfig([
  ...nextVitals,
  {
    files: ["src/components/sticker-studio.tsx"],
    // The studio uses nested render helpers to preserve input focus; the plugin misclassifies their effects and event handlers.
    rules: {
      "@next/next/no-img-element": "off",
      "react-hooks/purity": "off",
      "react-hooks/set-state-in-effect": "off"
    }
  },
  globalIgnores([".next/**", ".next-desktop/**", "release/**", "out/**", "build/**", "next-env.d.ts"])
]);
