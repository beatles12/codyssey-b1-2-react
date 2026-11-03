import { useCallback, useEffect, useState } from "react";
import { toErrorKey } from "../lib/errors.js";

/**
 * 비동기 함수(loadData)를 실행해 { data, isLoading, error, reload }로 돌려주는 공통 훅.
 * loadData가 바뀌거나 reload를 부르면 다시 요청한다. loadData는 useCallback으로 고정해서 넘긴다.
 * @returns {{ data: any, isLoading: boolean, error: string, reload: () => void }} error는 i18n key
 */
function useAsyncData(loadData) {
  const [reloadCount, setReloadCount] = useState(0);
  const [result, setResult] = useState({ loader: null, count: -1, data: null, error: "" });

  useEffect(() => {
    let isCurrent = true;
    const save = (data, error) => {
      if (isCurrent) setResult({ loader: loadData, count: reloadCount, data, error });
    };

    loadData()
      .then(data => save(data, ""))
      .catch(error => save(null, toErrorKey(error)));

    return () => {
      isCurrent = false;
    };
  }, [loadData, reloadCount]);

  const reload = useCallback(() => setReloadCount(count => count + 1), []);
  const isLoading = result.loader !== loadData || result.count !== reloadCount;

  return { data: isLoading ? null : result.data, isLoading, error: isLoading ? "" : result.error, reload };
}

export default useAsyncData;
