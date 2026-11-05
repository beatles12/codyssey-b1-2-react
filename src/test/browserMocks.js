// jsdom에 없는 브라우저 기능(matchMedia, IntersectionObserver)을 테스트용으로 흉내 낸다.

let isSystemDark = false;
const themeListeners = new Set();

/** 테스트에서 운영체제 다크 모드 설정을 바꾼다. */
export function setSystemDark(value) {
  isSystemDark = value;
  themeListeners.forEach(listener => listener({ matches: value }));
}

/** 테스트 사이에 상태를 초기화한다. */
export function resetBrowserMocks() {
  isSystemDark = false;
  themeListeners.clear();
}

window.matchMedia = query => ({
  media: query,
  get matches() {
    return query.includes("dark") ? isSystemDark : false;
  },
  addEventListener: (_, listener) => themeListeners.add(listener),
  removeEventListener: (_, listener) => themeListeners.delete(listener),
});

window.IntersectionObserver = class {
  constructor(callback) {
    this.callback = callback;
  }

  observe(target) {
    this.callback([{ target, isIntersecting: true }], this);
  }

  unobserve() {}

  disconnect() {}
};

window.scrollTo = () => {};
Element.prototype.scrollIntoView = () => {};

window.ResizeObserver = class {
  observe() {}

  unobserve() {}

  disconnect() {}
};
