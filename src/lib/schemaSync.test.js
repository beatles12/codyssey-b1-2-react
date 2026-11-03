import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { CATEGORIES, EMPTY_PROJECT_FORM, SUMMARY_MAX, TITLE_MAX } from "./projectForm.js";
import { fromRow, toRow } from "./projectsApi.js";

// supabase/01_schema.sql 과 React 코드의 필드가 어긋나지 않았는지 글자 그대로 비교한다. (DB에 연결하지 않음)
const schema = readFileSync(resolve(process.cwd(), "supabase/01_schema.sql"), "utf8");
const tableBody = schema.match(/create table if not exists public\.projects \(([\s\S]*?)\n\);/)[1];
const sqlColumns = tableBody
  .split("\n")
  .map(line => line.trim().match(/^([a-z_]+)\s/)?.[1])
  .filter(Boolean);
const apiSource = readFileSync(resolve(process.cwd(), "src/lib/projectsApi.js"), "utf8");
const apiColumns = apiSource.match(/const COLUMNS =\s*"([^"]+)"/)[1].split(",").map(column => column.trim());

describe("SQL 스키마 ↔ React 코드 일치", () => {
  it("projectsApi가 읽는 열이 테이블 열과 정확히 같다", () => {
    expect([...apiColumns].sort()).toEqual([...sqlColumns].sort());
  });

  it("저장할 때 보내는 열(toRow)은 모두 테이블에 있다", () => {
    const sentColumns = Object.keys(toRow({ ...EMPTY_PROJECT_FORM, techStack: [] }));
    sentColumns.forEach(column => expect(sqlColumns).toContain(column));
  });

  it("화면 객체(fromRow)는 폼의 모든 칸을 채울 수 있다", () => {
    const row = Object.fromEntries(sqlColumns.map(column => [column, null]));
    const project = fromRow(row);
    Object.keys(EMPTY_PROJECT_FORM).forEach(field => expect(project).toHaveProperty(field));
  });

  it("주소 형식 규칙이 validators.js 와 같다", () => {
    const validators = readFileSync(resolve(process.cwd(), "src/lib/validators.js"), "utf8");
    expect(validators).toContain("const URL_PATTERN = /^https?:\\/\\/\\S+$/i;");
    expect(validators).toContain("const SITE_PATH_PATTERN = /^\\/[A-Za-z0-9_.~%-][A-Za-z0-9_.~%/-]*$/;");
    expect(schema).toContain("github_url ~* '^https?://[^[:space:]]+$'");
    expect(schema).toContain("demo_url ~* '^https?://[^[:space:]]+$'");
    expect(schema).toContain("image_url ~* '^https?://[^[:space:]]+$' or image_url ~ '^/[A-Za-z0-9_.~%-][A-Za-z0-9_.~%/-]*$'");
  });

  it("분류 값과 글자 수 제한이 같다", () => {
    const sqlCategories = schema.match(/category in \(([^)]+)\)/)[1].match(/'([a-z]+)'/g).map(value => value.slice(1, -1));
    expect(sqlCategories).toEqual(CATEGORIES);
    expect(schema).toContain(`char_length(title) between 1 and ${TITLE_MAX}`);
    expect(schema).toContain(`char_length(summary) between 1 and ${SUMMARY_MAX}`);
  });
});
