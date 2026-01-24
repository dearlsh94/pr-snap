/**
 * PR-Snap - Background Service Worker
 * https://github.com/dearlsh94/pr-snap
 *
 * Copyright (c) 2025 Ethan (dearlsh94)
 * This work is licensed under CC BY-NC-SA 4.0.
 */

/**
 * 확장 프로그램 설치 시 로그 출력
 */
chrome.runtime.onInstalled.addListener(() => {
  console.log(
    "%c PR-Snap Installed! 🚀 ",
    `
      background: linear-gradient(to right, #12c2e9, #c471ed, #f64f59);
      color: white;
      padding: 10px;
      font-size: 20px;
      font-weight: bold;
      border-radius: 5px;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
    `
  );

  console.log(
    "%c Version %c1.1.0 %c\n" +
      "%c Developed by %cEthan (dearlsh94)%c\n" +
      "%c Github: %chttps://github.com/dearlsh94/pr-snap",
    "color: #666; font-size: 12px;",
    "color: #1a73e8; font-size: 12px; font-weight: bold;",
    "color: #666;",
    "color: #666; font-size: 12px;",
    "color: #2ea44f; font-size: 12px; font-weight: bold;",
    "color: #666;",
    "color: #666; font-size: 12px;",
    "color: #1a73e8; font-size: 12px; text-decoration: underline;"
  );

  console.log(
    "%c Ready to snap your PR links! 📎 ",
    "color: #c471ed; font-size: 14px; font-weight: bold;"
  );
});

/**
 * PR URL 유효성 검사
 * @param {string} url
 * @returns {boolean}
 */
const isPRUrl = (url) => /github\.com\/.*\/.*\/pull\/\d+/.test(url);

/**
 * 키보드 단축키로 PR 링크 복사 실행
 * executeScript 내부에서 실행되는 코드 (독립적인 컨텍스트)
 */
const executeCopyScript = async (url) => {
  // ===== Constants =====
  const HEADER_SELECTORS = [
    "h1.gh-header-title",
    "h1[data-component='PH_Title']",
    "h1.prc-PageHeader-Title-p0Mgh",
    ".gh-header-title",
  ];

  const TITLE_SELECTORS = [
    "bdi.js-issue-title",
    ".markdown-title",
    "bdi",
    ".js-issue-title",
  ];

  const TAG_SELECTORS = [
    "span.f1-light",
    "span.fgColor-muted",
    "span.color-fg-muted",
    "span.pl-2",
  ];

  // ===== Toast =====
  const showToast = (message, isSuccess = true) => {
    const existingToast = document.querySelector(".pr-snap-toast");
    if (existingToast) existingToast.remove();

    const toast = document.createElement("div");
    toast.className = `pr-snap-toast ${isSuccess ? "pr-snap-toast-success" : "pr-snap-toast-error"}`;
    toast.innerHTML = `
      <span class="pr-snap-toast-icon">${isSuccess ? "✓" : "✕"}</span>
      <span class="pr-snap-toast-message">${message}</span>
    `;

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
        .pr-snap-toast-message { letter-spacing: 0.3px; }
        @keyframes pr-snap-toast-slide-in {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes pr-snap-toast-slide-out {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
        .pr-snap-toast-hide {
          animation: pr-snap-toast-slide-out 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.classList.add("pr-snap-toast-hide");
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  };

  // ===== PR Parser =====
  const getHeaderElement = () => {
    for (const selector of HEADER_SELECTORS) {
      const element = document.querySelector(selector);
      if (element) return element;
    }
    return null;
  };

  const getTitle = (headerElement) => {
    for (const selector of TITLE_SELECTORS) {
      const titleEl = headerElement?.querySelector(selector);
      if (titleEl?.innerText?.trim()) return titleEl.innerText.trim();
    }
    return "NO TITLE";
  };

  const getTag = (headerElement) => {
    for (const selector of TAG_SELECTORS) {
      const tagEl = headerElement?.querySelector(selector);
      if (tagEl?.innerText?.trim()) return tagEl.innerText.trim();
    }
    const spans = headerElement?.querySelectorAll("span");
    if (spans?.length > 0) {
      const lastSpan = spans[spans.length - 1];
      if (lastSpan?.innerText?.trim()) return lastSpan.innerText.trim();
    }
    return "NO TAG";
  };

  // ===== Clipboard =====
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
      plainText: `${title} ${tag} - ${url}`,
      htmlText: null,
    }),
  };

  // ===== Main Logic =====
  try {
    const headerElement = getHeaderElement();
    if (!headerElement) {
      showToast("Failed to get PR information.", false);
      return;
    }

    const title = getTitle(headerElement);
    const tag = getTag(headerElement);
    const { format = "html" } = await chrome.storage.sync.get("format");
    const { plainText, htmlText } = createClipboardData[format](
      title,
      tag,
      url
    );

    const clipboardItem = new ClipboardItem({
      "text/plain": new Blob([plainText], { type: "text/plain" }),
      "text/html": new Blob([htmlText || plainText], { type: "text/html" }),
    });

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

/**
 * 키보드 단축키 이벤트 핸들러
 */
chrome.commands.onCommand.addListener((command) => {
  if (command !== "copy_pr_link_shortcut") return;

  chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
    const url = tabs[0].url;

    if (!isPRUrl(url)) {
      console.log(
        "%c❌ [PR-Snap] %cThe current URL is not a GitHub PR link.",
        "background: #cf222e; color: white; padding: 2px 6px; border-radius: 4px;",
        "color: #cf222e; font-weight: bold;"
      );
      return;
    }

    const granted = await chrome.permissions.request({
      permissions: ["clipboardWrite"],
    });

    if (!granted) {
      console.log(
        "%c❌ [PR-Snap] %cClipboard permission was not granted.",
        "background: #cf222e; color: white; padding: 2px 6px; border-radius: 4px;",
        "color: #cf222e; font-weight: bold;"
      );
      return;
    }

    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: executeCopyScript,
      args: [url],
    });
  });
});

