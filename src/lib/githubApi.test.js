import { fetchGithubRepos, sortByPreference } from "./githubApi.js";

const repo = (name, extra = {}) => ({ name, description: `${name} 설명`, language: "JavaScript", html_url: `https://github.com/beatles12/${name}`, ...extra });

describe("githubApi", () => {
  it("선호 저장소를 정해진 순서대로 앞에 둔다", () => {
    const sorted = sortByPreference([repo("other"), repo("codyssey"), repo("codyssey-b2-1-budget")]);
    expect(sorted.map(item => item.name)).toEqual(["codyssey-b2-1-budget", "codyssey", "other"]);
  });

  it("포크·보관 저장소를 빼고 최대 4개를 카드 모양으로 돌려준다", async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => [repo("a"), repo("b", { fork: true }), repo("c", { archived: true }), repo("d"), repo("e"), repo("f"), repo("codyssey-mini-npu")],
    });

    const repos = await fetchGithubRepos();

    expect(repos).toHaveLength(4);
    expect(repos[0]).toMatchObject({ title: "codyssey-mini-npu", techStack: ["Python"], imageUrl: "/images/miniNPU.png" });
    expect(repos.map(item => item.title)).not.toContain("b");
    expect(repos[1].summary).toEqual({ ko: "a 설명", en: "a 설명" });
  });

  it("응답이 실패하면 오류를 던진다", async () => {
    fetch.mockResolvedValue({ ok: false, status: 403 });
    await expect(fetchGithubRepos()).rejects.toThrow("GitHub API 403");
  });
});
