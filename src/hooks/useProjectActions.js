import { useCallback, useRef, useState } from "react";
import { toErrorKey } from "../lib/errors.js";
import { createProject, deleteProject, updateProject } from "../lib/projectsApi.js";

/**
 * 프로젝트 등록·수정·삭제를 실행하고 진행 중 여부와 오류를 관리한다.
 * 각 함수는 성공하면 결과를, 실패하면 null을 돌려주고 error(i18n key)를 채운다.
 * 이미 실행 중이면 새 요청을 무시해 연속 클릭으로 같은 데이터가 두 번 저장되지 않게 한다.
 */
function useProjectActions() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const isRunningRef = useRef(false);

  const run = useCallback(async task => {
    if (isRunningRef.current) return null;
    isRunningRef.current = true;
    setIsSubmitting(true);
    setError("");
    try {
      return await task();
    } catch (caught) {
      setError(toErrorKey(caught));
      return null;
    } finally {
      isRunningRef.current = false;
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
