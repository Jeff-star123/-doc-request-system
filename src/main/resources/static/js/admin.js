// Automatic Scroll Reveal Animation
const observerOptions = { root: null, threshold: 0.15 };
const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.reveal-on-scroll').forEach(el => observer.observe(el));

// Scroll-Driven Focal Card Focus Effect
const focalCards = document.querySelectorAll('.focal-card');
function updateFocalCards() {
    const viewportCenter = window.innerHeight / 2;
    let closestCard = null;
    let minDistance = Infinity;

    focalCards.forEach(card => {
        const rect = card.getBoundingClientRect();
        const cardCenter = rect.top + rect.height / 2;
        const distance = Math.abs(viewportCenter - cardCenter);

        if (distance < minDistance) {
            minDistance = distance;
            closestCard = card;
        }
    });

    focalCards.forEach(card => {
        if (card === closestCard) {
            card.classList.add('is-focused');
        } else {
            card.classList.remove('is-focused');
        }
    });
}

window.addEventListener('scroll', updateFocalCards, { passive: true });
window.addEventListener('resize', updateFocalCards);
document.addEventListener('DOMContentLoaded', updateFocalCards);

// Dark Mode Initialization & Toggle Handler
const htmlElement = document.documentElement;
const themeToggleBtn = document.getElementById('themeToggleBtn');
const themeIcon = document.getElementById('themeIcon');

function setTheme(theme) {
    htmlElement.setAttribute('data-bs-theme', theme);
    localStorage.setItem('portal_theme', theme);
    if (themeIcon) {
        if (theme === 'dark') {
            themeIcon.className = 'bi bi-sun-fill text-warning';
        } else {
            themeIcon.className = 'bi bi-moon-fill';
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

// Draggable Floating GIF Widget
(function makeDraggable() {
    const widget = document.getElementById("draggableWidget");
    if (!widget) return;
    let isDragging = false;
    let startX, startY, initialLeft, initialTop;

    window.addEventListener("DOMContentLoaded", () => {
        const savedLeft = localStorage.getItem("gif_pos_left");
        const savedTop = localStorage.getItem("gif_pos_top");

        if (savedLeft !== null && savedTop !== null) {
            widget.style.left = savedLeft + "px";
            widget.style.top = savedTop + "px";
        } else {
            const maxLeft = window.innerWidth - widget.offsetWidth;
            const maxTop = window.innerHeight - widget.offsetHeight;
            widget.style.left = Math.max(0, maxLeft / 2) + "px";
            widget.style.top = Math.max(0, maxTop / 2) + "px";
        }
    });

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