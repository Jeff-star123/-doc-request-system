// Dark Mode Initialization & Toggle Handler
const htmlElement = document.documentElement;
const themeToggleBtn = document.getElementById('themeToggleBtn');
const themeIcon = document.getElementById('themeIcon');

function setTheme(theme) {
    htmlElement.setAttribute('data-bs-theme', theme);
    localStorage.setItem('portal_theme', theme);
    if (themeIcon) {
        if (theme === 'dark') {
            themeIcon.className = 'bi bi-sun-fill fs-5 text-warning';
        } else {
            themeIcon.className = 'bi bi-moon-fill fs-5';
        }
    }
}

const savedTheme = localStorage.getItem('portal_theme') || 'light';
setTheme(savedTheme);

if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-bs-theme');
        setTheme(currentTheme === 'dark' ? 'light' : 'dark');
    });
}

// Toggle Password Visibility
function togglePassword(inputId, iconId) {
    const passwordInput = document.getElementById(inputId);
    const eyeIcon = document.getElementById(iconId);

    if (passwordInput && eyeIcon) {
        if (passwordInput.type === "password") {
            passwordInput.type = "text";
            eyeIcon.classList.remove("bi-eye");
            eyeIcon.classList.add("bi-eye-slash");
        } else {
            passwordInput.type = "password";
            eyeIcon.classList.remove("bi-eye-slash");
            eyeIcon.classList.add("bi-eye");
        }
    }
}

// Sliding Auth Card State Controller
(function initSlidingAuthController() {
    const appWrapper = document.getElementById('heroAppWrapper');
    const interactiveSeal = document.getElementById('interactiveSealWrapper');
    const slidingContainer = document.getElementById('slidingAuthContainer');
    const btnCloseSlidingCard = document.getElementById('btnCloseSlidingCard');
    
    const panelHeading = document.getElementById('panelHeading');
    const panelSubtext = document.getElementById('panelSubtext');
    const btnToggleAuthMode = document.getElementById('btnToggleAuthMode');
    const btnToggleAuthText = document.getElementById('btnToggleAuthText');

    const loginViewWrapper = document.getElementById('loginViewWrapper');
    const registerViewWrapper = document.getElementById('registerViewWrapper');

    if (!appWrapper || !interactiveSeal || !slidingContainer) return;

    function openSlidingContainer() {
        appWrapper.classList.add('card-active');
        slidingContainer.classList.remove('d-none');
        setTimeout(() => {
            slidingContainer.classList.add('is-open');
        }, 30);
    }

    function closeSlidingContainer() {
        slidingContainer.classList.remove('is-open');
        setTimeout(() => {
            slidingContainer.classList.add('d-none');
            appWrapper.classList.remove('card-active');
        }, 400);
    }

    function toggleAuthMode() {
        if (!slidingContainer) return;

        if (slidingContainer.classList.contains('active-signup')) {
            // Switch to LOGIN Mode
            slidingContainer.classList.remove('active-signup');
            if (panelHeading) panelHeading.innerText = "Hello, Resident!";
            if (panelSubtext) panelSubtext.innerText = "Don't have an account yet?";
            if (btnToggleAuthText) btnToggleAuthText.innerText = "Create Account";

            setTimeout(() => {
                if (registerViewWrapper) registerViewWrapper.classList.add('d-none');
                if (loginViewWrapper) loginViewWrapper.classList.remove('d-none');
            }, 300);
        } else {
            // Switch to REGISTER Mode
            slidingContainer.classList.add('active-signup');
            if (panelHeading) panelHeading.innerText = "Welcome Back!";
            if (panelSubtext) panelSubtext.innerText = "Already have an account?";
            if (btnToggleAuthText) btnToggleAuthText.innerText = "Login to Portal";

            setTimeout(() => {
                if (loginViewWrapper) loginViewWrapper.classList.add('d-none');
                if (registerViewWrapper) registerViewWrapper.classList.remove('d-none');
            }, 300);
        }
    }

    // Event Listeners
    interactiveSeal.addEventListener('click', openSlidingContainer);
    if (btnCloseSlidingCard) btnCloseSlidingCard.addEventListener('click', closeSlidingContainer);
    if (btnToggleAuthMode) btnToggleAuthMode.addEventListener('click', toggleAuthMode);

    // Auto reveal sliding card if Spring Boot redirects with alert messages
    const hasErrorAlert = document.querySelector('.alert-danger');
    const hasSuccessAlert = document.querySelector('.alert-success');
    if (hasErrorAlert || hasSuccessAlert) {
        openSlidingContainer();
    }
})();

// Custom Toast Notification Helper
function showCustomToast(type, title, message) {
    const toast = document.getElementById("customToast");
    const toastIcon = document.getElementById("customToastIcon");
    const toastTitle = document.getElementById("customToastTitle");
    const toastMsg = document.getElementById("customToastMessage");

    if (!toast) return;

    toast.className = "alert fade show border-0 shadow-lg p-3 rounded-4 mb-3";

    if (type === "success") {
        toast.style.background = "rgba(25, 135, 84, 0.15)";
        toast.style.color = "#198754";
        toastIcon.className = "bi bi-check-circle-fill fs-4 text-success";
        toastTitle.className = "alert-heading mb-0 fw-bold text-success";
    } else if (type === "error") {
        toast.style.background = "rgba(220, 53, 69, 0.15)";
        toast.style.color = "#dc3545";
        toastIcon.className = "bi bi-exclamation-triangle-fill fs-4 text-danger";
        toastTitle.className = "alert-heading mb-0 fw-bold text-danger";
    } else {
        toast.style.background = "rgba(13, 110, 253, 0.15)";
        toast.style.color = "#0d6efd";
        toastIcon.className = "bi bi-info-circle-fill fs-4 text-primary";
        toastTitle.className = "alert-heading mb-0 fw-bold text-primary";
    }

    toastTitle.innerText = title;
    toastMsg.innerText = message;
    toast.classList.remove("d-none");
}

// Telegram OTP Registration Verification Handlers
function requestTelegramOtp() {
    const chatId = document.getElementById("telegramChatId").value.trim();
    if (!chatId) {
        showCustomToast("error", "Error", "Please enter your Telegram Chat ID first!");
        return;
    }

    fetch('/api/requests/telegram/send-otp?chatId=' + encodeURIComponent(chatId), { method: 'POST' })
        .then(res => res.json())
        .then(data => {
            document.getElementById("telegramOtpContainer").classList.remove("d-none");
            if (data.success) {
                showCustomToast("success", "OTP Sent!", "OTP dispatched to your Telegram via @BrgyDocRequestBot!");
            } else {
                showCustomToast("error", "Failed", data.message || "Failed to send OTP. Make sure you started the bot first!");
            }
        })
        .catch(() => {
            document.getElementById("telegramOtpContainer").classList.remove("d-none");
            showCustomToast("error", "Network Error", "Unable to reach server. Please check your network connection.");
        });
}

function verifyTelegramOtp() {
    const chatId = document.getElementById("telegramChatId").value.trim();
    const otpCode = document.getElementById("telegramOtpInput").value.trim();

    if (!otpCode) {
        showCustomToast("error", "Validation Error", "Please enter the 6-digit OTP code.");
        return;
    }

    fetch(`/api/requests/telegram/verify-otp?chatId=${encodeURIComponent(chatId)}&otp=${encodeURIComponent(otpCode)}`, { method: 'POST' })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                document.getElementById("telegramVerified").value = "true";
                const sendBtn = document.getElementById("btnSendTelegramOtp");
                sendBtn.className = "btn btn-success fw-semibold px-3 disabled";
                sendBtn.innerHTML = '<i class="bi bi-check-circle-fill"></i> Verified';
                document.getElementById("telegramOtpContainer").classList.add("d-none");
                showCustomToast("success", "Verified!", "Telegram Chat ID verified successfully!");
            } else {
                showCustomToast("error", "Verification Failed", data.message || "Invalid Telegram OTP code! Please try again.");
            }
        })
        .catch(() => {
            showCustomToast("error", "Server Unreachable", "Unable to verify OTP. Server is unreachable.");
        });
}

function validateForm() {
    const password = document.getElementById("regPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const isTelegramVerified = document.getElementById("telegramVerified").value;

    if (password !== confirmPassword) {
        showCustomToast("error", "Password Mismatch", "Passwords do not match!");
        return false;
    }

    if (isTelegramVerified !== "true") {
        showCustomToast("error", "Verification Required", "Please verify your Telegram Chat ID with the OTP before signing up!");
        return false;
    }

    return true;
}

// Draggable Floating GIF Widget Initial Position
(function makeDraggable() {
    const widget = document.getElementById("draggableWidget");
    if (!widget) return;

    let isDragging = false;
    let startX, startY, initialLeft, initialTop;

    function positionWidget() {
        const savedLeft = localStorage.getItem("gif_pos_left");
        const savedTop = localStorage.getItem("gif_pos_top");

        if (savedLeft !== null && savedTop !== null) {
            widget.style.left = savedLeft + "px";
            widget.style.top = savedTop + "px";
        } else {
            // Default initial placement in bottom-left corner
            const defaultLeft = 30;
            const defaultTop = window.innerHeight - 140;
            widget.style.left = defaultLeft + "px";
            widget.style.top = Math.max(20, defaultTop) + "px";
        }
        widget.style.bottom = "auto";
        widget.style.right = "auto";
    }

    if (document.readyState === 'complete') {
        positionWidget();
    } else {
        window.addEventListener("DOMContentLoaded", positionWidget);
    }

    widget.addEventListener("mousedown", dragStart);
    document.addEventListener("mousemove", dragMove);
    document.addEventListener("mouseup", dragEnd);

    widget.addEventListener("touchstart", dragStart, { passive: false });
    document.addEventListener("touchmove", dragMove, { passive: false });
    document.addEventListener("touchend", dragEnd);

    function dragStart(e) {
        isDragging = true;
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        const rect = widget.getBoundingClientRect();
        startX = clientX;
        startY = clientY;
        initialLeft = rect.left;
        initialTop = rect.top;

        widget.style.bottom = "auto";
        widget.style.right = "auto";
        widget.style.left = initialLeft + "px";
        widget.style.top = initialTop + "px";
    }

    function dragMove(e) {
        if (!isDragging) return;
        if (e.cancelable) e.preventDefault();

        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        const deltaX = clientX - startX;
        const deltaY = clientY - startY;

        if (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4) {
            hasDragged = true;
        }

        if (e.cancelable) e.preventDefault();

        let newLeft = initialLeft + deltaX;
        let newTop = initialTop + deltaY;

        const maxLeft = window.innerWidth - widget.offsetWidth;
        const maxTop = window.innerHeight - widget.offsetHeight;

        newLeft = Math.max(0, Math.min(newLeft, maxLeft));
        newTop = Math.max(0, Math.min(newTop, maxTop));

        widget.style.left = newLeft + "px";
        widget.style.top = newTop + "px";
    }

    function dragEnd() {
        if (isDragging) {
            isDragging = false;
            localStorage.setItem("gif_pos_left", parseInt(widget.style.left));
            localStorage.setItem("gif_pos_top", parseInt(widget.style.top));
        }
    }
})();

// Draggable Dify Chatbot Initialization
(function makeDifyDraggable() {
  let difyBtn = null;
  let isDragging = false;
  let hasDragged = false;
  let startX, startY, initialLeft, initialTop;

  function updateDifyPositions(left, top) {
    difyBtn = document.getElementById('dify-chatbot-bubble-button');
    if (!difyBtn) return;

    const btnWidth = difyBtn.offsetWidth || 56;
    const btnHeight = difyBtn.offsetHeight || 56;
    const maxLeft = window.innerWidth - btnWidth;
    const maxTop = window.innerHeight - btnHeight;

    const clampedLeft = Math.max(10, Math.min(left, maxLeft - 10));
    const clampedTop = Math.max(10, Math.min(top, maxTop - 10));

    difyBtn.style.setProperty('left', clampedLeft + 'px', 'important');
    difyBtn.style.setProperty('top', clampedTop + 'px', 'important');
    difyBtn.style.setProperty('bottom', 'auto', 'important');
    difyBtn.style.setProperty('right', 'auto', 'important');

    localStorage.setItem('dify_btn_left', clampedLeft);
    localStorage.setItem('dify_btn_top', clampedTop);

    const difyWindow = document.getElementById('dify-chatbot-bubble-window');
    if (difyWindow) {
      const isMobile = window.innerWidth <= 640;
      const winWidth = isMobile ? (window.innerWidth - 32) : 384;
      const winHeight = Math.min(608, window.innerHeight - 120);

      let winLeft, winTop;

      if (clampedLeft + winWidth > window.innerWidth - 16) {
        winLeft = Math.max(16, clampedLeft + btnWidth - winWidth);
      } else {
        winLeft = Math.max(16, clampedLeft);
      }

      if (clampedTop > winHeight + 20) {
        winTop = clampedTop - winHeight - 12;
      } else {
        winTop = clampedTop + btnHeight + 12;
      }

      winLeft = Math.max(10, Math.min(winLeft, window.innerWidth - winWidth - 10));
      winTop = Math.max(10, Math.min(winTop, window.innerHeight - winHeight - 10));

      difyWindow.style.setProperty('left', winLeft + 'px', 'important');
      difyWindow.style.setProperty('top', winTop + 'px', 'important');
      difyWindow.style.setProperty('bottom', 'auto', 'important');
      difyWindow.style.setProperty('right', 'auto', 'important');
    }
  }

  function initDifyDrag() {
    difyBtn = document.getElementById('dify-chatbot-bubble-button');
    if (!difyBtn) {
      setTimeout(initDifyDrag, 150);
      return;
    }

    difyBtn.style.position = 'fixed';
    difyBtn.style.touchAction = 'none';

    const savedLeft = localStorage.getItem('dify_btn_left');
    const savedTop = localStorage.getItem('dify_btn_top');

    if (savedLeft !== null && savedTop !== null) {
      updateDifyPositions(parseFloat(savedLeft), parseFloat(savedTop));
    } else {
      const defaultLeft = window.innerWidth - (difyBtn.offsetWidth || 56) - 24;
      const defaultTop = window.innerHeight - (difyBtn.offsetHeight || 56) - 24;
      updateDifyPositions(defaultLeft, defaultTop);
    }

    difyBtn.addEventListener('mousedown', dragStart);
    document.addEventListener('mousemove', dragMove);
    document.addEventListener('mouseup', dragEnd);

    difyBtn.addEventListener('touchstart', dragStart, { passive: false });
    document.addEventListener('touchmove', dragMove, { passive: false });
    document.addEventListener('touchend', dragEnd);

    difyBtn.addEventListener('click', (e) => {
      if (hasDragged) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        hasDragged = false;
      }
    }, true);

    const observer = new MutationObserver(() => {
      const currentLeft = parseFloat(difyBtn.style.left) || (window.innerWidth - 80);
      const currentTop = parseFloat(difyBtn.style.top) || (window.innerHeight - 80);
      updateDifyPositions(currentLeft, currentTop);
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  function dragStart(e) {
    difyBtn = document.getElementById('dify-chatbot-bubble-button');
    if (!difyBtn) return;

    isDragging = true;
    hasDragged = false;

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const rect = difyBtn.getBoundingClientRect();
    startX = clientX;
    startY = clientY;
    initialLeft = rect.left;
    initialTop = rect.top;
  }

  function dragMove(e) {
    if (!isDragging) return;

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const deltaX = clientX - startX;
    const deltaY = clientY - startY;

    if (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4) {
      hasDragged = true;
    }

    if (e.cancelable) e.preventDefault();

    updateDifyPositions(initialLeft + deltaX, initialTop + deltaY);
  }

  function dragEnd() {
    if (isDragging) {
      isDragging = false;
    }
  }

  if (document.readyState === 'complete') {
    initDifyDrag();
  } else {
    window.addEventListener('load', initDifyDrag);
  }

  window.addEventListener('resize', () => {
    if (difyBtn) {
      const currentLeft = parseFloat(difyBtn.style.left) || (window.innerWidth - 80);
      const currentTop = parseFloat(difyBtn.style.top) || (window.innerHeight - 80);
      updateDifyPositions(currentLeft, currentTop);
    }
  });
})();