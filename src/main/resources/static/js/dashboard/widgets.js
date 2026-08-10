// =========================================================
// ANTI-SPAM PRINT WARNING & DRAGGABLE GIF WIDGET MODULE
// =========================================================

// Anti-Spam Print Warning Logic
(function initAntiSpamPrint() {
    let printClicks = [];
    let countdownInterval = null;
    const modalEl = document.getElementById('spamWarningModal');
    if (!modalEl) return;
    const warningModal = new bootstrap.Modal(modalEl);
    const countdownEl = document.getElementById('spamCountdown');

    document.addEventListener('click', function (e) {
        const printBtn = e.target.closest('.print-btn');
        if (!printBtn) return;

        const now = Date.now();
        printClicks = printClicks.filter(timestamp => now - timestamp < 10000);
        printClicks.push(now);

        if (printClicks.length >= 5) {
            e.preventDefault();
            window.location.href = '/spam-banned';
        } else if (printClicks.length === 4) {
            e.preventDefault();
            let remainingSeconds = 10;
            if (countdownEl) countdownEl.innerText = remainingSeconds;
            
            if (countdownInterval) clearInterval(countdownInterval);
            
            countdownInterval = setInterval(() => {
                remainingSeconds--;
                if (remainingSeconds > 0) {
                    if (countdownEl) countdownEl.innerText = remainingSeconds;
                } else {
                    clearInterval(countdownInterval);
                    warningModal.hide();
                }
            }, 1000);

            warningModal.show();
        }
    });
})();

// Draggable Floating GIF Widget Initialization
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