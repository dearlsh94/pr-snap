/**
 * PR-Snap - PR Parser
 * https://github.com/dearlsh94/pr-snap
 *
 * Copyright (c) 2025 Ethan (dearlsh94)
 * This work is licensed under CC BY-NC-SA 4.0.
 */

/**
 * PR Header 요소를 찾습니다.
 * @returns {HTMLElement|null}
 */
const getHeaderElement = () => {
  for (const selector of HEADER_SELECTORS) {
    const element = document.querySelector(selector);
    if (element) {
      return element;
    }
  }
  return null;
};

/**
 * Header에서 PR 제목을 추출합니다.
 * @param {HTMLElement} headerElement
 * @returns {string}
 */
const getTitle = (headerElement) => {
  for (const selector of TITLE_SELECTORS) {
    const titleEl = headerElement?.querySelector(selector);
    if (titleEl?.innerText?.trim()) {
      return titleEl.innerText.trim();
    }
  }

  // headerElement 자체가 title일 수 있음
  if (headerElement?.innerText?.trim()) {
    const clone = headerElement.cloneNode(true);
    const spans = clone.querySelectorAll("span");
    spans.forEach((span) => span.remove());
    const text = clone.textContent?.trim();
    if (text) return text;
  }

  return "NO TITLE";
};

/**
 * Header에서 PR 번호(태그)를 추출합니다.
 * @param {HTMLElement} headerElement
 * @returns {string}
 */
const getTag = (headerElement) => {
  for (const selector of TAG_SELECTORS) {
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

/**
 * PR 정보를 파싱합니다.
 * @param {HTMLElement} headerElement
 * @returns {{ title: string, tag: string, url: string }}
 */
const parsePRInfo = (headerElement) => {
  return {
    title: getTitle(headerElement),
    tag: getTag(headerElement),
    url: window.location.href,
  };
};

