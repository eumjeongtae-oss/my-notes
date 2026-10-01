import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // 프론트/백엔드 경계 규칙.
  // 프론트(apps/web)는 DB나 백엔드 코드를 직접 쓰지 않고, 데이터는 오직 src/api/의 API 호출로 받는다.
  // 회사에서 프론트 레포와 백엔드 레포가 나뉜 것과 같은 상태를 도구로 강제한다.
  {
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@prisma/*", "prisma", "prisma/*"],
              message:
                "프론트는 DB(Prisma)를 직접 쓰지 않습니다. 백엔드 API를 호출하세요 (src/api/).",
            },
            {
              group: ["**/apps/api/**", "**/api/src/**", "**/api/prisma/**"],
              message:
                "프론트는 백엔드(apps/api) 코드를 import하지 않습니다. 백엔드 API를 호출하세요 (src/api/).",
            },
          ],
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
