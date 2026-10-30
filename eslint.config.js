import { existsSync, readdirSync } from "node:fs";

import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

const ZAPS_DIR = `${import.meta.dirname}/packages/zaps`;

// A zap folder with no package.json is a simple zap: one self-contained workflow.ts that an agent deploys as is.
// catalog.test.ts checks it instead. A complex zap has a package.json and gets every rule below.
const simpleZaps = readdirSync(ZAPS_DIR, { withFileTypes: true })
  .filter(
    (entry) =>
      entry.isDirectory() &&
      !["node_modules", "scripts"].includes(entry.name) &&
      !existsSync(`${ZAPS_DIR}/${entry.name}/package.json`),
  )
  .map((entry) => `packages/zaps/${entry.name}/`);

export default tseslint.config(
  {
    ignores: [
      ".asdf/",
      ".fallow/",
      ".pnpm-store/",
      "**/node_modules/",
      ...simpleZaps,
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: [
            "eslint.config.js",
            "packages/*/vitest.config.ts",
          ],
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          args: "all",
          argsIgnorePattern: "^_",
          caughtErrors: "all",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
    },
  },
);
