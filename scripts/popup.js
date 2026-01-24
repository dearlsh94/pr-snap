/**
 * PR-Snap - Popup Script
 * https://github.com/dearlsh94/pr-snap
 *
 * Copyright (c) 2025 Ethan (dearlsh94)
 * This work is licensed under CC BY-NC-SA 4.0.
 */

/**
 * 포맷 설정을 저장합니다.
 * @param {string} format
 */
const saveFormat = async (format) => {
  try {
    await chrome.storage.sync.set({ format });
    console.log(
      "%c💾 [PR-Snap] %cFormat setting saved:",
      "background: #2ea043; color: white; padding: 2px 6px; border-radius: 4px;",
      "color: #2ea043; font-weight: bold;",
      format
    );
  } catch (error) {
    console.error(
      "%c❌ [PR-Snap] %cFailed to save format setting:",
      "background: #cf222e; color: white; padding: 2px 6px; border-radius: 4px;",
      "color: #cf222e; font-weight: bold;",
      error
    );
  }
};

/**
 * 포맷 설정을 불러옵니다.
 * @returns {Promise<string>}
 */
const loadFormat = async () => {
  try {
    const { format = "html" } = await chrome.storage.sync.get("format");
    return format;
  } catch (error) {
    console.error(
      "%c❌ [PR-Snap] %cFailed to load format setting:",
      "background: #cf222e; color: white; padding: 2px 6px; border-radius: 4px;",
      "color: #cf222e; font-weight: bold;",
      error
    );
    return "html";
  }
};

/**
 * 포맷 선택기를 초기화합니다.
 * @param {HTMLSelectElement} formatSelector
 */
const initializeFormatSelector = async (formatSelector) => {
  const savedFormat = await loadFormat();
  formatSelector.value = savedFormat;

  formatSelector.addEventListener("change", (e) => {
    saveFormat(e.target.value);
  });
};

/**
 * 포맷 선택기 관찰 및 초기화
 */
const observeFormatSelector = () => {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === "childList") {
        const formatSelector = document.getElementById("formatSelector");
        if (formatSelector) {
          initializeFormatSelector(formatSelector);
          observer.disconnect();
        }
      }
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  // 즉시 확인
  const formatSelector = document.getElementById("formatSelector");
  if (formatSelector) {
    initializeFormatSelector(formatSelector);
    observer.disconnect();
  }
};

// 초기화 실행
observeFormatSelector();

