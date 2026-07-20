// Flat config for ESLint 9/10. Replaces the former .eslintrc.cjs verbatim in rule
// terms — ESLint 10 dropped support for .eslintrc and .eslintignore entirely, which
// is what was failing CI. The rule set is intentionally unchanged from the old
// config; this is a format migration, not a strictness change.
import js from "@eslint/js";
import tsparser from "@typescript-eslint/parser";
import tsplugin from "@typescript-eslint/eslint-plugin";
import globals from "globals";

export default [
  {
    ignores: [
      "dist/",
      "node_modules/",
      // Vendored third-party source — not ours to restyle. Replaces .eslintignore.
      "src/vendor/",
      "**/*.js",
      "**/*.cjs",
      "**/*.mjs",
    ],
  },
  js.configs.recommended,
  {
    files: ["src/**/*.ts"],
    languageOptions: {
      parser: tsparser,
      ecmaVersion: 2022,
      sourceType: "module",
      globals: { ...globals.node, ...globals.jest },
    },
    plugins: { "@typescript-eslint": tsplugin },
    rules: {
      // The TS-aware unused-vars rule supersedes the base one, which would otherwise
      // double-report and misfire on type-only constructs.
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "error",
      "@typescript-eslint/no-explicit-any": "warn",
      "prefer-const": "error",
      "no-var": "error",
      "no-console": "off", // MCP servers log diagnostics to stderr via console.
    },
  },
];
