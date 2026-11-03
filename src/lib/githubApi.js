import { withTimeout } from "./request.js";

// GitHub 공개 API에서 저장소 목록을 가져와 프로젝트 카드 모양으로 바꾼다. (B1-1 설정 계승)

const GITHUB_USERNAME = "beatles12";
const MAX_REPOS = 4;
const PREFERRED_REPOS = ["codyssey-b2-1-budget", "codyssey-mini-npu", "codyssey-quiz-game", "codyssey"];
const REPO_DETAILS = {
  "codyssey-b2-1-budget": {
    tech: "Python",
    image: "/images/budget.png",
    en: "A Python budget tracker for income, expenses, and monthly summaries.",
  },
  "codyssey-mini-npu": {
    tech: "Python",
    image: "/images/miniNPU.png",
    en: "A Python mini NPU simulator for matrix and MAC operations.",
  },
  "codyssey-quiz-game": {
    tech: "Python",
    image: "/images/quiz_game.png",
    en: "A Python console quiz game with questions, answers, and score tracking.",
  },
  codyssey: {
    tech: "Git · Docker · Nginx",
    image: "/images/workstation.png",
    ko: "macOS에서 Git·GitHub·OrbStack·Docker·Nginx를 직접 구성한 개발 워크스테이션 구축 프로젝트입니다.",
    en: "A macOS development workstation configured with Git, GitHub, OrbStack, Docker, and Nginx.",
  },
};

/** 선호 저장소를 앞으로, 나머지는 원래 순서(최근 수정순)대로 정렬한다. */
export function sortByPreference(repos) {
  const rank = repo => {
    const index = PREFERRED_REPOS.indexOf(repo.name);
    return index === -1 ? PREFERRED_REPOS.length : index;
  };
  return [...repos].sort((a, b) => rank(a) - rank(b));
}

/** GitHub 응답 하나를 화면용 객체로 바꾼다. 설명은 { ko, en } 두 언어로 준비한다. */
export function toRepoCard(repo) {
  const details = REPO_DETAILS[repo.name] ?? {};
  return {
    id: repo.name,
    title: repo.name,
    summary: { ko: details.ko || repo.description || "", en: details.en || repo.description || "" },
    techStack: [details.tech || repo.language].filter(Boolean),
    imageUrl: details.image || "",
    url: repo.html_url,
  };
}

/** 공개 저장소 중 포크·보관 저장소를 빼고 최대 4개를 가져온다. */
export async function fetchGithubRepos() {
  const response = await withTimeout(fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=100`));
  if (!response.ok) throw new Error(`GitHub API ${response.status}`);

  const repos = await response.json();
  const usable = repos.filter(repo => !repo.fork && !repo.archived);
  return sortByPreference(usable).slice(0, MAX_REPOS).map(toRepoCard);
}
