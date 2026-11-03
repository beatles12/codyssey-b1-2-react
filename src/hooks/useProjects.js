import useAsyncData from "./useAsyncData.js";
import { fetchProjects } from "../lib/projectsApi.js";

/** 프로젝트 목록을 Supabase에서 불러온다. { projects, isLoading, error, reload } */
function useProjects() {
  const { data, ...status } = useAsyncData(fetchProjects);
  return { projects: data ?? [], ...status };
}

export default useProjects;
