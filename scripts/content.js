/**
 * PR-Snap - Content Script
 * https://github.com/dearlsh94/pr-snap
 *
 * Copyright (c) 2025 Ethan (dearlsh94)
 * This work is licensed under CC BY-NC-SA 4.0.
 */

// MutationObserver - 지속적으로 DOM 변화 감시
const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    if (mutation.type === "childList") {
      tryAddCopyIcon();
      break;
    }
  }
});

/**
 * Content Script 초기화
 */
const initializeContentScript = () => {
  // 초기 실행 (재시도 포함)
  tryAddCopyIconWithRetry();

  // DOM 변화 감시 시작
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
};

// GitHub Turbo 네비게이션 지원
document.addEventListener("turbo:load", () => tryAddCopyIconWithRetry());
document.addEventListener("turbo:render", () => tryAddCopyIconWithRetry());

// pjax 지원 (구버전 GitHub)
document.addEventListener("pjax:end", () => tryAddCopyIconWithRetry());

// popstate 이벤트 (브라우저 뒤로/앞으로 가기)
window.addEventListener("popstate", () => tryAddCopyIconWithRetry());

// 초기화 실행
initializeContentScript();

