import { useCallback } from "react";
import useAsyncData from "./useAsyncData.js";
import { fetchProjectById } from "../lib/projectsApi.js";

/** 주소의 id로 프로젝트 하나를 불러온다. id가 바뀌면 다시 불러온다. { project, isLoading, error, reload } */
function useProject(id) {
  const loadProject = useCallback(() => fetchProjectById(id), [id]);
  const { data, ...status } = useAsyncData(loadProject);
  return { project: data, ...status };
}

export default useProject;
