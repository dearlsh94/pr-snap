/**
 * PR-Snap - Copy Icon
 * https://github.com/dearlsh94/pr-snap
 *
 * Copyright (c) 2025 Ethan (dearlsh94)
 * This work is licensed under CC BY-NC-SA 4.0.
 */

/**
 * 복사 아이콘 클릭 핸들러
 * @param {MouseEvent} event
 */
const handleCopyClick = async (event) => {
  // 버튼의 부모 header를 직접 찾음 (더 안정적)
  const button = event.currentTarget;
  const headerElement = button.closest("h1") || getHeaderElement();

  if (!headerElement) {
    showToast("Failed to get PR information.", false);
    return;
  }

  const prInfo = parsePRInfo(headerElement);
  const { format = "html" } = await chrome.storage.sync.get("format");
  const result = await copyPRToClipboard(prInfo, format);

  if (result.success) {
    showToast("Successfully copied to clipboard!", true);
  } else {
    showToast("Failed to copy to clipboard.", false);
  }
};

/**
 * 복사 아이콘 SVG
 */
const COPY_ICON_SVG = `
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

/**
 * 복사 아이콘 버튼을 생성합니다.
 * @returns {HTMLButtonElement}
 */
const createCopyIcon = () => {
  const copyIcon = document.createElement("button");
  copyIcon.className = "pr-snap-copy-icon";
  copyIcon.setAttribute("aria-label", "Copy PR link");
  copyIcon.innerHTML = COPY_ICON_SVG;
  copyIcon.addEventListener("click", handleCopyClick);
  return copyIcon;
};

/**
 * Header에 복사 아이콘을 추가합니다.
 * @param {HTMLElement} headerElement
 */
const addCopyIcon = (headerElement) => {
  if (!headerElement || headerElement.querySelector(".pr-snap-copy-icon"))
    return;

  const copyIcon = createCopyIcon();
  headerElement.insertBefore(copyIcon, headerElement.firstElementChild);
};

/**
 * 복사 아이콘 추가를 시도합니다.
 * @returns {boolean} 성공 여부
 */
const tryAddCopyIcon = () => {
  const headerElement = getHeaderElement();
  if (headerElement) {
    addCopyIcon(headerElement);
    return true;
  }
  return false;
};

/**
 * 재시도 로직으로 복사 아이콘 추가를 시도합니다.
 * @param {number} maxRetries - 최대 재시도 횟수
 * @param {number} interval - 재시도 간격 (ms)
 */
const tryAddCopyIconWithRetry = (
  maxRetries = RETRY_CONFIG?.maxRetries || 10,
  interval = RETRY_CONFIG?.interval || 300
) => {
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

