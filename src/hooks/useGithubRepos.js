import useAsyncData from "./useAsyncData.js";
import { fetchGithubRepos } from "../lib/githubApi.js";

/** GitHub 저장소 목록을 불러온다. { repos, isLoading, error, reload } */
function useGithubRepos() {
  const { data, ...status } = useAsyncData(fetchGithubRepos);
  return { repos: data ?? [], ...status };
}

export default useGithubRepos;
