/**
 * PR-Snap - Clipboard Utilities
 * https://github.com/dearlsh94/pr-snap
 *
 * Copyright (c) 2025 Ethan (dearlsh94)
 * This work is licensed under CC BY-NC-SA 4.0.
 */

/**
 * 클립보드 데이터 생성 함수들
 */
const createClipboardData = {
  html: (title, tag, url) => ({
    plainText: `${title} ${tag}`,
    htmlText: `<a href="${url}" target="_blank">${title} ${tag}</a>`,
  }),
  markdown: (title, tag, url) => ({
    plainText: `[${title} ${tag}](${url})`,
    htmlText: null,
  }),
  plain: (title, tag, url) => ({
    plainText: `${title}\n${url}`,
    htmlText: `${title}<br>${url}`,
  }),
};

/**
 * 클립보드에 데이터를 복사합니다.
 * @param {string} plainText - 일반 텍스트
 * @param {string|null} htmlText - HTML 텍스트 (선택)
 * @returns {Promise<boolean>} 성공 여부
 */
const writeToClipboard = async (plainText, htmlText) => {
  const clipboardItem = new ClipboardItem({
    "text/plain": new Blob([plainText], { type: "text/plain" }),
    "text/html": new Blob([htmlText || plainText], { type: "text/html" }),
  });

  await navigator.clipboard.write([clipboardItem]);
};

/**
 * PR 정보를 클립보드에 복사합니다.
 * @param {{ title: string, tag: string, url: string }} prInfo
 * @param {string} format - 포맷 (html, markdown, plain)
 * @returns {Promise<{ success: boolean, plainText?: string, htmlText?: string, error?: Error }>}
 */
const copyPRToClipboard = async (prInfo, format = "html") => {
  const { title, tag, url } = prInfo;
  const { plainText, htmlText } = createClipboardData[format](title, tag, url);

  try {
    await writeToClipboard(plainText, htmlText);

    console.log(
      "%c🔗 [PR-Snap] %cSuccessfully copied to clipboard!",
      "background: #0969da; color: white; padding: 2px 6px; border-radius: 4px;",
      "color: #0969da; font-weight: bold;",
      "\n📋 Copied content:",
      { format, plainText, htmlText }
    );

    return { success: true, plainText, htmlText };
  } catch (error) {
    console.error(
      "%c❌ [PR-Snap] %cFailed to copy to clipboard:",
      "background: #cf222e; color: white; padding: 2px 6px; border-radius: 4px;",
      "color: #cf222e; font-weight: bold;",
      error
    );

    return { success: false, error };
  }
};

