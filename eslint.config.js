import globals from "globals";
import pluginJs from "@eslint/js";
import prettier from "eslint-plugin-prettier";

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node, // Add Node.js globals
      },
    },
  },
  pluginJs.configs.recommended,
  {
    plugins: {
      prettier: prettier,
    },
    rules: {
      "prettier/prettier": "error",
      "no-unused-vars": "warn",
      "no-console": "warn",
      "no-undefined": "warn",
      "no-unreachable": "error",
      "no-extra-semi": "error",
      "no-unexpected-multiline": "error",
      quotes: ["error", "double"],
    },
  },
];
