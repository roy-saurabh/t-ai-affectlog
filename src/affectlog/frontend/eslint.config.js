// ESLint flat config (required since ESLint 9). Uses only the already-installed
// @typescript-eslint parser and plugin; no additional dependencies.
//
// Violations that predate this config are recorded in eslint-suppressions.json
// so that `npm run lint` fails only on new problems. Remove entries as the
// underlying code is fixed (`npx eslint src --prune-suppressions`).
import tsPlugin from "@typescript-eslint/eslint-plugin";

const files = ["src/**/*.{ts,tsx}"];

export default [
  { ignores: ["dist/**", "node_modules/**"] },
  ...tsPlugin.configs["flat/recommended"].map((config) => ({ ...config, files })),
  {
    files,
    rules: {
      // Referenced by an existing eslint-disable directive in src/security.
      "no-control-regex": "error",
    },
  },
];
