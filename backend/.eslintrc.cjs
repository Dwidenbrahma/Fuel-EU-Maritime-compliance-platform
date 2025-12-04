module.exports = {
  root: true,

  env: {
    node: true,
    es2021: true,
  },

  parser: "@typescript-eslint/parser",

  parserOptions: {
    ecmaVersion: 12,
    sourceType: "module",
  },

  plugins: ["@typescript-eslint", "vitest"],

  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended",
  ],

  overrides: [
    {
      files: ["tests/**/*.test.ts"],
      plugins: ["vitest"], // enables vitest rules
      rules: {
        // Allow flexibility in tests
        "@typescript-eslint/no-unused-vars": "off",
        "@typescript-eslint/no-explicit-any": "off",
      },
    },
  ],

  rules: {
    "@typescript-eslint/no-unused-vars": "warn",
    "@typescript-eslint/no-explicit-any": "off",
    "prettier/prettier": "error",
  },
};
