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

const observer = new MutationObserver(async (mutations, obs) => {
  const getHeaderElement = () => {
    return document.querySelector("h1.gh-header-title");
  };

  const headerElement = getHeaderElement();
  if (!headerElement) {
    console.error(
      "%c❌ [PR-Snap] %cFailed to get header element.",
      "background: #cf222e; color: white; padding: 2px 6px; border-radius: 4px;",
      "color: #cf222e; font-weight: bold;"
    );
    return;
  }

  const getTitle = (headerElement) => {
    const titleTextEl = headerElement.querySelector("bdi");
    return (titleTextEl.innerText || "NO TITLE")?.trim();
  };
  const getTag = (headerElement) => {
    const tagElement = headerElement.querySelector("span");
    return (tagElement.innerText || "NO TAG")?.trim();
  };

  const title = getTitle(headerElement);
  const tag = getTag(headerElement);
  const url = window.location.href;

  const { format = "html" } = await chrome.storage.sync.get("format");
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
  const clipboardData = createClipboardData[format](title, tag, url);

  const copyToClipboard = async ({ plainText, htmlText }) => {
    const clipboardData = new ClipboardItem({
      "text/plain": new Blob([plainText], {
        type: "text/plain",
      }),
      "text/html": new Blob([htmlText], {
        type: "text/html",
      }),
    });

    await navigator.clipboard
      .write([clipboardData])
      .then(() => {
        console.log(
          "%c🔗 [PR-Snap] %cSuccessfully copied to clipboard!",
          "background: #0969da; color: white; padding: 2px 6px; border-radius: 4px;",
          "color: #0969da; font-weight: bold;",
          "\n📋 Copied content:",
          { format, plainText, htmlText }
        );
        showToast("Successfully copied to clipboard!", true);
      })
      .catch((err) => {
        console.error(
          "%c❌ [PR-Snap] %cFailed to copy to clipboard:",
          "background: #cf222e; color: white; padding: 2px 6px; border-radius: 4px;",
          "color: #cf222e; font-weight: bold;",
          err
        );
        showToast("Failed to copy to clipboard.", false);
      });
  };
  const createCopyIcon = () => {
    const copyIcon = document.createElement("button");
    copyIcon.className = "pr-snap-copy-icon";
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
    copyIcon.addEventListener("click", () => {
      copyToClipboard(clipboardData);
    });

    // 스타일 추가
    const style = document.createElement("style");
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

    return copyIcon;
  };

  const addCopyIon = (headerElement) => {
    const isExist = headerElement.querySelector(".pr-snap-copy-icon");
    if (isExist) return;

    const copyIcon = createCopyIcon();
    headerElement.insertBefore(copyIcon, headerElement.firstElementChild);
  };

  addCopyIon(headerElement);

  obs.disconnect();
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});
