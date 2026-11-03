// 사생활 보호 모드 등에서 localStorage 접근이 실패해도 앱이 멈추지 않도록 감싼 도우미.

/** 저장된 값을 읽는다. 실패하면 null. */
export function readStorage(key) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

/** 값을 저장한다. value가 null이면 지운다. */
export function writeStorage(key, value) {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch {
    // 저장에 실패해도 현재 화면 동작에는 영향이 없으므로 무시한다.
  }
}
