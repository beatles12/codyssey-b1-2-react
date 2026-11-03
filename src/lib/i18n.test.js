import { translate, translations } from "./i18n.js";

/** 객체 안의 모든 문구 경로를 "a.b.c" 형태로 모은다. */
function collectKeys(node, prefix = "") {
  return Object.entries(node).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return value && typeof value === "object" && !Array.isArray(value) ? collectKeys(value, path) : [path];
  });
}

describe("i18n", () => {
  it("한국어와 영어 사전의 문구 목록이 같다", () => {
    expect(collectKeys(translations.en)).toEqual(collectKeys(translations.ko));
  });

  it("경로로 문구를 찾고 {이름} 자리를 채운다", () => {
    expect(translate("ko", "projects.count", { count: 3 })).toBe("3개의 프로젝트를 표시하고 있습니다.");
    expect(translate("en", "projects.count", { count: 3 })).toBe("Showing 3 projects.");
  });

  it("없는 경로는 key를, 빈 key는 빈 문자열을 돌려준다", () => {
    expect(translate("ko", "no.such.key")).toBe("no.such.key");
    expect(translate("ko", "")).toBe("");
  });
});
