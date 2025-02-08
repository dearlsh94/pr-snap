/**
 * PR-Snap
 * https://github.com/dearlsh94/pr-snap
 *
 * Copyright (c) 2025 Ethan (dearlsh94)
 * This work is licensed under CC BY-NC-SA 4.0.
 * Commercial use is strictly prohibited.
 * https://creativecommons.org/licenses/by-nc-sa/4.0/
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

const initializeFormatSelector = async (formatSelector) => {
  const savedFormat = await loadFormat();
  formatSelector.value = savedFormat;

  formatSelector.addEventListener("change", (e) => {
    saveFormat(e.target.value);
  });
};

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

  const formatSelector = document.getElementById("formatSelector");
  if (formatSelector) {
    initializeFormatSelector(formatSelector);
    observer.disconnect();
  }
};

observeFormatSelector();
