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
                })
                .catch((err) => {
                  console.error(
                    "%c❌ [PR-Snap] %cFailed to copy to clipboard:",
                    "background: #cf222e; color: white; padding: 2px 6px; border-radius: 4px;",
                    "color: #cf222e; font-weight: bold;",
                    err
                  );
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
          }
        },
        args: [url],
      });
    });
  }
});
