/**
 * PR-Snap - Toast Notifications
 * https://github.com/dearlsh94/pr-snap
 *
 * Copyright (c) 2025 Ethan (dearlsh94)
 * This work is licensed under CC BY-NC-SA 4.0.
 */

/**
 * Toast 스타일을 주입합니다.
 */
const injectToastStyles = () => {
  if (document.querySelector("#pr-snap-toast-style")) return;

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
};

/**
 * Toast 메시지를 표시합니다.
 * @param {string} message - 표시할 메시지
 * @param {boolean} isSuccess - 성공 여부 (true: 성공, false: 실패)
 */
const showToast = (message, isSuccess = true) => {
  // 기존 Toast가 있으면 제거
  const existingToast = document.querySelector(".pr-snap-toast");
  if (existingToast) {
    existingToast.remove();
  }

  // 스타일 주입
  injectToastStyles();

  // Toast 생성
  const toast = document.createElement("div");
  toast.className = `pr-snap-toast ${isSuccess ? "pr-snap-toast-success" : "pr-snap-toast-error"}`;
  toast.innerHTML = `
    <span class="pr-snap-toast-icon">${isSuccess ? "✓" : "✕"}</span>
    <span class="pr-snap-toast-message">${message}</span>
  `;

  document.body.appendChild(toast);

  // 자동 숨김
  const duration = TOAST_CONFIG?.duration || 3000;
  const hideAnimationDuration = TOAST_CONFIG?.hideAnimationDuration || 300;

  setTimeout(() => {
    toast.classList.add("pr-snap-toast-hide");
    setTimeout(() => {
      toast.remove();
    }, hideAnimationDuration);
  }, duration);
};

