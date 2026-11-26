const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");
const prettierConfig = require("eslint-config-prettier/flat");
const tseslint = require("typescript-eslint");

module.exports = defineConfig([
  expoConfig,
  prettierConfig,
  {
    ignores: ["dist/*", "android/*", "drizzle/*", ".expo/*"],
  },
  {
    rules: {
      // Resetting state before an async load or syncing from a prop is intentional here.
      "react-hooks/set-state-in-effect": "off",
    },
  },
  {
    files: ["eslint.config.js"],
    languageOptions: { globals: { __dirname: "readonly" } },
  },
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname,
      },
    },
    plugins: { "@typescript-eslint": tseslint.plugin },
    rules: {
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-misused-promises": [
        "error",
        { checksVoidReturn: { attributes: false } },
      ],
    },
  },
]);
