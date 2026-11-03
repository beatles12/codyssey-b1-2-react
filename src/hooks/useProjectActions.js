import { useCallback, useState } from "react";
import { toErrorKey } from "../lib/errors.js";
import { createProject, deleteProject, updateProject } from "../lib/projectsApi.js";

/**
 * 프로젝트 등록·수정·삭제를 실행하고 진행 중 여부와 오류를 관리한다.
 * 각 함수는 성공하면 결과를, 실패하면 null을 돌려주고 error(i18n key)를 채운다.
 */
function useProjectActions() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const run = useCallback(async task => {
    setIsSubmitting(true);
    setError("");
    try {
      return await task();
    } catch (caught) {
      setError(toErrorKey(caught));
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const create = useCallback(input => run(() => createProject(input)), [run]);
  const update = useCallback((id, input) => run(() => updateProject(id, input)), [run]);
  const remove = useCallback(id => run(() => deleteProject(id).then(() => true)), [run]);
  const clearError = useCallback(() => setError(""), []);

  return { create, update, remove, isSubmitting, error, clearError };
}

export default useProjectActions;
