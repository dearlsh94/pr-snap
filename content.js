/**
 * PR-Snap
 * https://github.com/dearlsh94/pr-snap
 *
 * Copyright (c) 2025 Ethan (dearlsh94)
 * This work is licensed under CC BY-NC-SA 4.0.
 * Commercial use is strictly prohibited.
 * https://creativecommons.org/licenses/by-nc-sa/4.0/
 */

// Toast 메시지 표시 함수
const showToast = (message, isSuccess = true) => {
  // 기존 Toast가 있으면 제거
  const existingToast = document.querySelector(".pr-snap-toast");
  if (existingToast) {
    existingToast.remove();
  }

  const toast = document.createElement("div");
  toast.className = `pr-snap-toast ${isSuccess ? "pr-snap-toast-success" : "pr-snap-toast-error"}`;
  toast.innerHTML = `
    <span class="pr-snap-toast-icon">${isSuccess ? "✓" : "✕"}</span>
    <span class="pr-snap-toast-message">${message}</span>
  `;

  // Toast 스타일 추가 (한 번만)
  if (!document.querySelector("#pr-snap-toast-style")) {
    const style = document.createElement("style");
    style.id = "pr-snap-toast-style";
    style.textContent = `
      .pr-snap-toast {
        position: fixed;
        top: 20px;
        right: 20px;
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 14px 20px;
        border-radius: 10px;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif;
        font-size: 14px;
        font-weight: 500;
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12), 0 4px 10px rgba(0, 0, 0, 0.06);
        z-index: 2147483647;
        animation: pr-snap-toast-slide-in 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        backdrop-filter: blur(10px);
      }

      .pr-snap-toast-success {
        background: linear-gradient(135deg, rgba(35, 134, 54, 0.95), rgba(46, 160, 67, 0.95));
        color: #ffffff;
        border: 1px solid rgba(255, 255, 255, 0.1);
      }

      .pr-snap-toast-error {
        background: linear-gradient(135deg, rgba(207, 34, 46, 0.95), rgba(218, 54, 51, 0.95));
        color: #ffffff;
        border: 1px solid rgba(255, 255, 255, 0.1);
      }

      .pr-snap-toast-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 22px;
        height: 22px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.2);
        font-size: 12px;
        font-weight: bold;
      }

      .pr-snap-toast-message {
        letter-spacing: 0.3px;
      }

      @keyframes pr-snap-toast-slide-in {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }

      @keyframes pr-snap-toast-slide-out {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(100%);
          opacity: 0;
        }
      }

      .pr-snap-toast-hide {
        animation: pr-snap-toast-slide-out 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      }
    `;
    document.head.appendChild(style);
  }

  document.body.appendChild(toast);

  // 3초 후 자동으로 사라짐
  setTimeout(() => {
    toast.classList.add("pr-snap-toast-hide");
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3000);
};

// PR 정보 추출 헬퍼 함수들
// GitHub의 다양한 PR 페이지 구조에 대응
const HEADER_SELECTORS = [
  "h1.gh-header-title",                           // Conversation 탭 (기존 UI)
  "h1[data-component='PH_Title']",                // Files Changed, Commits 탭 (새 UI)
  "h1.prc-PageHeader-Title-p0Mgh",                // 새 UI 클래스명
  ".gh-header-title",                             // 클래스만으로 찾기
  "[data-testid='issue-title']",                  // data-testid
  "#partial-discussion-header .gh-header-title",  // Discussion header 내부
];

const getHeaderElement = () => {
  for (const selector of HEADER_SELECTORS) {
    const element = document.querySelector(selector);
    if (element) {
      return element;
    }
  }
  return null;
};

const getTitle = (headerElement) => {
  // 여러 가능한 title 위치 시도
  const titleSelectors = [
    "bdi.js-issue-title",                    // Conversation 탭
    ".markdown-title",                        // 공통 (새 UI & 기존 UI)
    "bdi",                                    // fallback
    ".js-issue-title",                        // JS hook 클래스
    "[data-testid='issue-title']",           // data-testid
  ];
  for (const selector of titleSelectors) {
    const titleEl = headerElement?.querySelector(selector);
    if (titleEl?.innerText?.trim()) {
      return titleEl.innerText.trim();
    }
  }
  // headerElement 자체가 title일 수 있음
  if (headerElement?.innerText?.trim()) {
    // span (PR 번호)를 제외한 텍스트 추출
    const clone = headerElement.cloneNode(true);
    const spans = clone.querySelectorAll("span");
    spans.forEach(span => span.remove());
    const text = clone.textContent?.trim();
    if (text) return text;
  }
  return "NO TITLE";
};

const getTag = (headerElement) => {
  // PR 번호를 포함하는 span 찾기 (# 기호와 숫자가 있는 span)
  const tagSelectors = [
    "span.f1-light",                          // Conversation 탭
    "span.fgColor-muted",                     // Files Changed, Commits 탭 (새 UI)
    "span.color-fg-muted",                    // 색상 클래스
    "span.pl-2",                              // padding 클래스
  ];
  for (const selector of tagSelectors) {
    const tagEl = headerElement?.querySelector(selector);
    if (tagEl?.innerText?.trim()) {
      return tagEl.innerText.trim();
    }
  }
  // fallback: 마지막 span 사용
  const spans = headerElement?.querySelectorAll("span");
  if (spans && spans.length > 0) {
    const lastSpan = spans[spans.length - 1];
    if (lastSpan?.innerText?.trim()) {
      return lastSpan.innerText.trim();
    }
  }
  return "NO TAG";
};

const createClipboardData = {
  html: (title, tag, url) => ({
    plainText: `${title} ${tag}`,
    htmlText: `<a href="${url}" target="_blank">${title} ${tag}</a>`,
  }),
  markdown: (title, tag, url) => ({
    plainText: `[${title} ${tag}](${url})`,
  }),
  plain: (title, tag, url) => ({
    plainText: `${title} ${tag} - ${url}`,
  }),
};

// 클릭 시점에 데이터를 수집하여 복사 (클로저 캡처 문제 해결)
const handleCopyClick = async (event) => {
  // 버튼의 부모 header를 직접 찾음 (더 안정적)
  const button = event.currentTarget;
  const headerElement = button.closest("h1") || getHeaderElement();
  
  if (!headerElement) {
    showToast("Failed to get PR information.", false);
    return;
  }

  const title = getTitle(headerElement);
  const tag = getTag(headerElement);
  const url = window.location.href;

  const { format = "html" } = await chrome.storage.sync.get("format");
  const clipboardData = createClipboardData[format](title, tag, url);

  const { plainText, htmlText } = clipboardData;
  const clipboardItem = new ClipboardItem({
    "text/plain": new Blob([plainText], { type: "text/plain" }),
    "text/html": new Blob([htmlText || plainText], { type: "text/html" }),
  });

  try {
    await navigator.clipboard.write([clipboardItem]);
    console.log(
      "%c🔗 [PR-Snap] %cSuccessfully copied to clipboard!",
      "background: #0969da; color: white; padding: 2px 6px; border-radius: 4px;",
      "color: #0969da; font-weight: bold;",
      "\n📋 Copied content:",
      { format, plainText, htmlText }
    );
    showToast("Successfully copied to clipboard!", true);
  } catch (err) {
    console.error(
      "%c❌ [PR-Snap] %cFailed to copy to clipboard:",
      "background: #cf222e; color: white; padding: 2px 6px; border-radius: 4px;",
      "color: #cf222e; font-weight: bold;",
      err
    );
    showToast("Failed to copy to clipboard.", false);
  }
};

// 스타일 추가 (한 번만)
const injectStyles = () => {
  if (document.querySelector("#pr-snap-icon-style")) return;

  const style = document.createElement("style");
  style.id = "pr-snap-icon-style";
  style.textContent = `
    .pr-snap-copy-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 4px;
      margin-right: 8px;
      border: none;
      background: transparent;
      cursor: pointer;
      border-radius: 6px;
      color: #57606a;
      transition: all 0.2s ease;
    }

    .pr-snap-copy-icon:hover {
      background-color: #f3f4f6;
      color: #0969da;
    }

    .pr-snap-icon {
      display: block;
    }

    .icon-bg {
      fill: #ffffff;
    }

    .pr-snap-copy-icon:hover .icon-bg {
      fill: #f6f8fa;
    }
  `;
  document.head.appendChild(style);
};

// 복사 아이콘 생성
const createCopyIcon = () => {
  const copyIcon = document.createElement("button");
  copyIcon.className = "pr-snap-copy-icon";
  copyIcon.setAttribute("aria-label", "Copy PR link");
  copyIcon.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" class="pr-snap-icon">
      <rect x="3" y="4" width="37" height="37" rx="1" class="icon-bg" stroke="currentColor" stroke-width="1.4"/>
      <rect x="8" y="8" width="37" height="37" rx="1" class="icon-bg" stroke="currentColor" stroke-width="1.4"/>
      <path d="M18 15V38" stroke="currentColor" stroke-width="2"/>
      <circle cx="18" cy="15" r="3" class="icon-bg" stroke="currentColor" stroke-width="2"/>
      <circle cx="18" cy="38" r="3" class="icon-bg" stroke="currentColor" stroke-width="2"/>
      <path d="M28 15H34C35.1046 15 36 15.8954 36 17V38" stroke="currentColor" stroke-width="2"/>
      <circle cx="28" cy="15" r="3" class="icon-bg" stroke="currentColor" stroke-width="2"/>
      <circle cx="36" cy="38" r="3" class="icon-bg" stroke="currentColor" stroke-width="2"/>
    </svg>
  `;
  copyIcon.addEventListener("click", handleCopyClick);
  return copyIcon;
};

// 아이콘 추가 함수
const addCopyIcon = (headerElement) => {
  if (!headerElement || headerElement.querySelector(".pr-snap-copy-icon")) return;

  injectStyles();
  const copyIcon = createCopyIcon();
  headerElement.insertBefore(copyIcon, headerElement.firstElementChild);
};

// 아이콘 추가 시도
const tryAddCopyIcon = () => {
  const headerElement = getHeaderElement();
  if (headerElement) {
    addCopyIcon(headerElement);
    return true;
  }
  return false;
};

// 재시도 로직 (header가 늦게 로드되는 경우 대응)
const tryAddCopyIconWithRetry = (maxRetries = 10, interval = 300) => {
  let retries = 0;
  
  const attempt = () => {
    if (tryAddCopyIcon()) {
      return; // 성공
    }
    
    retries++;
    if (retries < maxRetries) {
      setTimeout(attempt, interval);
    }
  };
  
  attempt();
};

// MutationObserver - 지속적으로 DOM 변화 감시
const observer = new MutationObserver((mutations) => {
  // header가 추가/변경되었는지 확인
  for (const mutation of mutations) {
    if (mutation.type === "childList") {
      // 새로 추가된 노드 중 header가 있거나, header의 부모가 변경된 경우
      tryAddCopyIcon();
      break; // 한 번만 확인하면 됨
    }
  }
});

// 초기화 함수
const initialize = () => {
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
initialize();
