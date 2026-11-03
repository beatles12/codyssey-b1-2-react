import { useEffect, useState } from "react";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/** 방금 입력한 글자에 따라 다음 글자까지 기다릴 시간(ms). B1-1과 같은 리듬. */
export function getTypingDelay(char) {
  if (char === "\n") return 300;
  if (".!?".includes(char)) return 450;
  if (char === "," || char === "，") return 270;
  if (char === " ") return 85;
  return 110;
}

/**
 * text를 한 글자씩 늘려 가며 돌려준다. isActive가 true가 된 뒤 startDelay(ms) 후 시작한다.
 * 움직임 줄이기 설정이거나 언어 전환으로 문구가 바뀌면 전체 문구를 바로 보여준다.
 */
function useTypingEffect(text, isActive, startDelay = 0) {
  const [initialText] = useState(text);
  const [prefersReducedMotion] = useState(() => window.matchMedia(REDUCED_MOTION_QUERY).matches);
  const [typedCount, setTypedCount] = useState(0);
  const isDone = prefersReducedMotion || text !== initialText || typedCount >= text.length;

  useEffect(() => {
    if (!isActive || isDone) return undefined;

    const delay = typedCount === 0 ? startDelay : getTypingDelay(text[typedCount - 1]);
    const timerId = setTimeout(() => setTypedCount(count => count + 1), delay);
    return () => clearTimeout(timerId);
  }, [isActive, isDone, typedCount, text, startDelay]);

  return isDone ? text : text.slice(0, typedCount);
}

export default useTypingEffect;
