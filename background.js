/**
 * PR-Snap
 * https://github.com/dearlsh94/pr-snap
 *
 * Copyright (c) 2025 Ethan (dearlsh94)
 * This work is licensed under CC BY-NC-SA 4.0.
 * Commercial use is strictly prohibited.
 * https://creativecommons.org/licenses/by-nc-sa/4.0/
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
    "%c Version %c1.0.0 %c\n" +
      "%c Developed by %cEthan (dearlsh94)%c\n" +
      "%c Github: %chttps://github.com/dearlsh94/pr-snap",
    // Version Style
    "color: #666; font-size: 12px;",
    "color: #1a73e8; font-size: 12px; font-weight: bold;",
    "color: #666;", // Change Line
    // Developed by Style
    "color: #666; font-size: 12px;",
    "color: #2ea44f; font-size: 12px; font-weight: bold;",
    "color: #666;", // Change Line
    // GitHub Style
    "color: #666; font-size: 12px;",
    "color: #1a73e8; font-size: 12px; text-decoration: underline;"
  );

  console.log(
    "%c Ready to snap your PR links! 📎 ",
    "color: #c471ed; font-size: 14px; font-weight: bold;"
  );
});

chrome.commands.onCommand.addListener((command) => {
  if (command === "copy_pr_link_shortcut") {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      const url = tabs[0].url;

      const isPRUrl = /github\.com\/.*\/.*\/pull\/\d+/.test(url);
      if (!isPRUrl) {
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
        func: async (url) => {
          // Toast 메시지 표시 함수
          const showToast = (message, isSuccess = true) => {
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
              setTimeout(() => {
                toast.remove();
              }, 300);
            }, 3000);
          };

          try {
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
              showToast("PR 정보를 찾을 수 없습니다.", false);
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
              const clipboardItemData = new ClipboardItem({
                "text/plain": new Blob([plainText], {
                  type: "text/plain",
                }),
                "text/html": new Blob([htmlText], {
                  type: "text/html",
                }),
              });

              await navigator.clipboard
                .write([clipboardItemData])
                .then(() => {
                  console.log(
                    "%c🔗 [PR-Snap] %cSuccessfully copied to clipboard!",
                    "background: #0969da; color: white; padding: 2px 6px; border-radius: 4px;",
                    "color: #0969da; font-weight: bold;",
                    "\n📋 Copied content:",
                    { format, plainText, htmlText }
                  );
                  showToast("PR 링크가 복사되었습니다!", true);
                })
                .catch((err) => {
                  console.error(
                    "%c❌ [PR-Snap] %cFailed to copy to clipboard:",
                    "background: #cf222e; color: white; padding: 2px 6px; border-radius: 4px;",
                    "color: #cf222e; font-weight: bold;",
                    err
                  );
                  showToast("복사에 실패했습니다.", false);
                });
            };

            copyToClipboard(clipboardData);
          } catch (err) {
            console.error(
              "%c❌ [PR-Snap] %cFailed to copy to clipboard:",
              "background: #cf222e; color: white; padding: 2px 6px; border-radius: 4px;",
              "color: #cf222e; font-weight: bold;",
              err
            );
            showToast("복사에 실패했습니다.", false);
          }
        },
        args: [url],
      });
    });
  }
});
