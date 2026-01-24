/**
 * PR-Snap - Constants
 * https://github.com/dearlsh94/pr-snap
 *
 * Copyright (c) 2025 Ethan (dearlsh94)
 * This work is licensed under CC BY-NC-SA 4.0.
 */

// GitHub PR 페이지 Header Selectors
const HEADER_SELECTORS = [
  "h1.gh-header-title", // Conversation 탭 (기존 UI)
  "h1[data-component='PH_Title']", // Files Changed, Commits 탭 (새 UI)
  "h1.prc-PageHeader-Title-p0Mgh", // 새 UI 클래스명
  ".gh-header-title", // 클래스만으로 찾기
  "[data-testid='issue-title']", // data-testid
  "#partial-discussion-header .gh-header-title", // Discussion header 내부
];

// PR Title Selectors
const TITLE_SELECTORS = [
  "bdi.js-issue-title", // Conversation 탭
  ".markdown-title", // 공통 (새 UI & 기존 UI)
  "bdi", // fallback
  ".js-issue-title", // JS hook 클래스
  "[data-testid='issue-title']", // data-testid
];

// PR Tag (번호) Selectors
const TAG_SELECTORS = [
  "span.f1-light", // Conversation 탭
  "span.fgColor-muted", // Files Changed, Commits 탭 (새 UI)
  "span.color-fg-muted", // 색상 클래스
  "span.pl-2", // padding 클래스
];

// Toast 설정
const TOAST_CONFIG = {
  duration: 3000,
  hideAnimationDuration: 300,
};

// 재시도 설정
const RETRY_CONFIG = {
  maxRetries: 10,
  interval: 300,
};

