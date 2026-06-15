// Flat ESLint config (ESLint v9+) for the Node/CommonJS backend.
const prettier = require("eslint-config-prettier");

module.exports = [
  {
    ignores: ["node_modules/**"],
  },
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "commonjs",
      globals: {
        require: "readonly",
        module: "writable",
        process: "readonly",
        console: "readonly",
        __dirname: "readonly",
      },
    },
    rules: {
      "no-unused-vars": ["warn", { argsIgnorePattern: "^(req|res|next)$" }],
      "no-console": "off",
    },
  },
  {
    files: ["__tests__/**/*.js"],
    languageOptions: {
      globals: {
        describe: "readonly",
        it: "readonly",
        expect: "readonly",
      },
    },
  },
  prettier,
];
