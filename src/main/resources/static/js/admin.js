// =========================================================
// BARANGAY ADMIN CONSOLE 3D STAGE & AI ASSISTANT CONTROLLER
// =========================================================

let currentOverlayTab = 0;
let overlayHubModal = null;

// Open Overlay Hub Modal at specific Tab Index
function openOverlayHub(tabIndex) {
    if (!overlayHubModal) {
        const modalEl = document.getElementById('overlayHubModal');
        if (modalEl) overlayHubModal = new bootstrap.Modal(modalEl);
    }
    currentOverlayTab = tabIndex;
    if (overlayHubModal) overlayHubModal.show();
    setTimeout(() => {
        update3dOverlayHub();
        if (currentOverlayTab === 4) {
            updateDev3dCarousel();
        }
    }, 150);
}

function closeOverlayHub() {
    if (overlayHubModal) {
        overlayHubModal.hide();
    }
}

function switchOverlayTab(tabIndex) {
    currentOverlayTab = tabIndex;
    update3dOverlayHub();
}

function rotateOverlayHub(direction) {
    const total = 5; // 0: Requests, 1: Reactivations, 2: Users, 3: About, 4: Developers
    currentOverlayTab += direction;
    if (currentOverlayTab < 0) currentOverlayTab = total - 1;
    if (currentOverlayTab >= total) currentOverlayTab = 0;
    update3dOverlayHub();
}

function handleOverlayCardClick(cardIndex) {
    if (cardIndex !== currentOverlayTab) {
        currentOverlayTab = cardIndex;
        update3dOverlayHub();
    }
}

// 3D Revolving Stage Math (Centered for Mobile & PC)
function update3dOverlayHub() {
    const cards = document.querySelectorAll('.overlay-3d-card');
    const total = cards.length;
    if (total === 0) return;

    const isMobile = window.innerWidth <= 768;
    const spacing = isMobile ? 280 : 420;

    cards.forEach((card, index) => {
        let diff = index - currentOverlayTab;
        let absDiff = Math.abs(diff);

        let translateX = diff * spacing;
        let translateZ = -Math.min(absDiff * 220, 500);
        let rotateY = diff < 0 ? Math.min(Math.abs(diff) * 35, 60) : -Math.min(Math.abs(diff) * 35, 60);
        let scale = Math.max(1 - absDiff * 0.12, 0.65);
        let opacity = diff === 0 ? 1 : Math.max(0.35, 1 - absDiff * 0.4);

        card.style.transform = `translate(-50%, -50%) translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`;
        card.style.opacity = opacity;
        card.style.zIndex = 30 - absDiff;

        if (diff === 0) {
            card.classList.add('active-overlay-card');
            card.style.pointerEvents = 'auto';
            card.style.filter = 'none';
        } else {
            card.classList.remove('active-overlay-card');
            card.style.pointerEvents = 'auto';
            card.style.filter = 'brightness(0.55) blur(2px)';
        }
    });

    if (currentOverlayTab === 4) {
        setTimeout(updateDev3dCarousel, 50);
    }

    for (let i = 0; i < total; i++) {
        const tabBtn = document.getElementById(`modalTab${i}`);
        if (tabBtn) {
            if (i === currentOverlayTab) {
                tabBtn.classList.add('active');
            } else {
                tabBtn.classList.remove('active');
            }
        }
    }

    const navPillsMap = ['pillRequests', 'pillReactivations', 'pillUsers', 'pillAbout', 'pillDevs'];
    navPillsMap.forEach((pillId, idx) => {
        const pill = document.getElementById(pillId);
        if (pill) {
            if (idx === currentOverlayTab) {
                pill.classList.add('active');
            } else {
                pill.classList.remove('active');
            }
        }
    });
}

// DEVELOPER 3D CAROUSEL CONTROLLER
let currentDevTab = 0;

function updateDev3dCarousel() {
    const cards = document.querySelectorAll('.dev-3d-card');
    const total = cards.length;
    if (total === 0) return;

    const isMobile = window.innerWidth <= 768;
    const spacing = isMobile ? 180 : 260;

    cards.forEach((card, index) => {
        let diff = index - currentDevTab;
        
        if (diff > total / 2) diff -= total;
        if (diff < -total / 2) diff += total;

        let absDiff = Math.abs(diff);

        let translateX = diff * spacing;
        let translateZ = -Math.min(absDiff * 160, 400);
        let rotateY = diff < 0 ? Math.min(Math.abs(diff) * 28, 45) : -Math.min(Math.abs(diff) * 28, 45);
        let scale = Math.max(1 - absDiff * 0.12, 0.65);
        let opacity = Math.max(1 - absDiff * 0.35, 0);

        card.style.transform = `translate(-50%, -50%) translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`;
        card.style.opacity = opacity;
        card.style.zIndex = 30 - absDiff;

        if (diff === 0) {
            card.classList.add('active-dev-card');
            card.style.pointerEvents = 'auto';
            card.style.filter = 'none';
        } else {
            card.classList.remove('active-dev-card');
            card.style.pointerEvents = 'auto';
            card.style.filter = 'brightness(0.65) blur(1px)';
        }
    });
}

function rotateDev3d(direction) {
    const total = 7;
    currentDevTab += direction;
    if (currentDevTab < 0) currentDevTab = total - 1;
    if (currentDevTab >= total) currentDevTab = 0;
    updateDev3dCarousel();
}

function selectDev3d(index) {
    const total = 7;
    if (index >= 0 && index < total && index !== currentDevTab) {
        currentDevTab = index;
        updateDev3dCarousel();
    }
}

// TOGGLE ABOUT FEATURE CARDS
function toggleFeatureCard(cardElement) {
    const allCards = document.querySelectorAll('.about-feature-card');
    allCards.forEach(card => {
        if (card !== cardElement) {
            card.classList.remove('active');
        }
    });
    cardElement.classList.toggle('active');
}

// DIRECT EMBEDDED ADMIN AI ASSISTANT ENGINE
function fillAiQuery(text) {
    const aiInput = document.getElementById('aiStudioInput');
    if (aiInput) {
        aiInput.value = text;
        handleSendAiQuery();
    }
}

function handleSendAiQuery() {
    const aiInput = document.getElementById('aiStudioInput');
    const responseBox = document.getElementById('aiResponseContainer');
    const userQuestionText = document.getElementById('aiUserQuestionText');
    const aiAnswerText = document.getElementById('aiAnswerText');

    if (!aiInput || !aiInput.value.trim() || !responseBox) return;

    const query = aiInput.value.trim();
    userQuestionText.innerHTML = `<i class="bi bi-person-fill text-primary me-1"></i> Admin Asked: "${query}"`;
    responseBox.classList.remove('d-none');

    aiAnswerText.innerHTML = `
        <div class="d-flex align-items-center gap-2 py-1">
            <div class="spinner-border spinner-border-sm text-primary" role="status"></div>
            <span class="text-muted">Admin AI is analyzing system records...</span>
        </div>
    `;

    setTimeout(() => {
        const answer = generateAdminAiResponse(query);
        aiAnswerText.innerHTML = answer;
    }, 600);
}

function generateAdminAiResponse(query) {
    const q = query.toLowerCase().trim();
    const containsAny = (keywords) => keywords.some(k => q.includes(k));

    if (q === 'hi' || q === 'hello' || q === 'hey' || containsAny(['sino ka', 'who are you', 'what are you', 'magandang araw'])) {
        return `
            <strong><i class="bi bi-shield-lock-fill text-warning me-1"></i> Barangay Admin AI Assistant 👋</strong><br>
            Magandang araw, Administrator! Ako ang inyong <b>Barangay Admin AI Assistant</b>.<br><br>
            💡 <b>Maaari mo akong tanungin tungkol sa:</b><br>
            • <b>Document Request Approvals:</b> Paano mag-approve, mag-reject, o mag-delete ng requests.<br>
            • <b>Account Reactivations:</b> Paano i-approve ang deactivated residents.<br>
            • <b>OCR & Biometric Security:</b> Tesseract.js ID checking at MediaPipe Face scan.<br>
            • <b>User Directory & Anti-Spam:</b> Deactivating suspicious resident accounts.
        `;
    }

    if (containsAny(['approve', 'reject', 'remarks', 'paano mag approve', 'how to approve', 'document request', 'delete'])) {
        return `
            <strong><i class="bi bi-card-checklist text-primary me-1"></i> Document Request Management:</strong><br>
            • <b>Viewing OCR & Selfie Proof:</b> I-click ang <b>"View Verification"</b> button para makita ang uploaded Valid ID at Selfie holding ID ng residente.<br>
            • <b>Approving Requests:</b> I-click ang berdeng <b>Check</b> icon o <b>"Approve"</b> button, at maglagay ng optional remarks.<br>
            • <b>Rejecting Requests:</b> I-click ang pulang <b>X</b> icon, at maglagay ng dahilan (e.g., <i>"Unclear Selfie / Invalid ID"</i>).<br>
            • <b>Telegram Alert:</b> Matapos i-approve/reject, awtomatikong makakatanggap ng notification ang residente sa Telegram!
        `;
    }

    if (containsAny(['reactivate', 'reactivation', 'deactivated', 'lock out', 'unlock'])) {
        return `
            <strong><i class="bi bi-person-exclamation text-warning me-1"></i> Account Reactivation Management:</strong><br>
            • Kapag nag-deactivate ang isang residente ng kanyang account, kailangan nito ng <b>Admin Approval</b> para muling maka-login.<br>
            • Makikita ang mga humihingi ng reactivation sa <b>"Pending Account Reactivation Requests"</b> card o tab.<br>
            • I-click ang <b>"Approve"</b> button para ibalik ang access ng residente!
        `;
    }

    if (containsAny(['ocr', 'face scan', 'liveness', 'tesseract', 'mediapipe', 'verification', 'id check'])) {
        return `
            <strong><i class="bi bi-shield-check text-success me-1"></i> Identity Verification System:</strong><br>
            • <b>Tesseract OCR:</b> Awtomatikong binabasa ang text sa uploaded ID para makumpirma kung National ID, School ID, Driver's License, UMID, o Barangay ID ito.<br>
            • <b>MediaPipe Liveness Scan:</b> Sinisigurado ng system na buhay at totoong tao ang nag-aapply sa pamamagitan ng 3D head pose tracking (Left/Right turn).
        `;
    }

    if (containsAny(['spam', 'deactivate user', 'ban', 'user directory', 'anti-spam'])) {
        return `
            <strong><i class="bi bi-people-fill text-info me-1"></i> User Directory & Anti-Spam Controls:</strong><br>
            • Makikita ang lahat ng rehistradong accounts sa <b>"Registered Users Directory"</b> tab.<br>
            • Kung may resident na nagi-spam ng requests o nag-violate ng security rules, i-click ang <b>"Deactivate"</b> button sa tabi ng kanyang account para i-lockout siya.
        `;
    }

    if (containsAny(['developer', 'creator', 'who made', 'sino gumawa', 'bsit'])) {
        return `
            <strong><i class="bi bi-code-slash text-primary me-1"></i> BSIT Project Team:</strong><br>
            • <b>Lead Developer:</b> Jeffrey M. Serrano Jr.<br>
            • <b>Assistant Developer:</b> Jalayahay, Jessa Mae P.<br>
            • <b>Presentor:</b> Mines, Manzor M.<br>
            • <b>Documentation Team:</b> Gutierrez, Rovil B., Prescillas, Ej Y., Kurt Bactat Russel, Tyrone James Oribiada.
        `;
    }

    return `
        <strong><i class="bi bi-exclamation-triangle-fill text-warning me-1"></i> Admin AI Scope Notice:</strong><br>
        Administrator! 👋 Ako ang <b>Barangay Admin AI Assistant</b> na nakadisenyo para tumulong sa pamamahala ng portal.<br><br>
        💡 <b>Maaari mo akong tanungin tungkol sa:</b><br>
        • "Paano mag-approve o mag-reject ng document requests?"<br>
        • "Paano ang Account Reactivations?"<br>
        • "Paano gumagana ang OCR at Biometric Liveness Check?"<br>
        • "Paano i-deactivate ang spammer account?"
    `;
}

document.getElementById('btnSendAiQuery')?.addEventListener('click', handleSendAiQuery);
document.getElementById('aiStudioInput')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        handleSendAiQuery();
    }
});

document.getElementById('btnClearAiChat')?.addEventListener('click', () => {
    const responseBox = document.getElementById('aiResponseContainer');
    const aiInput = document.getElementById('aiStudioInput');
    if (responseBox) responseBox.classList.add('d-none');
    if (aiInput) aiInput.value = '';
});

// TOUCH SWIPE ENGINE
function detectSwipe(elementId, callback) {
    const element = document.getElementById(elementId);
    if (!element) return;

    let touchStartX = 0;
    let touchEndX = 0;

    element.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    element.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        const diffX = touchEndX - touchStartX;

        if (Math.abs(diffX) > 50) {
            if (diffX > 0) {
                callback(-1);
            } else {
                callback(1);
            }
        }
    }, { passive: true });
}

// SCROLL REVEAL & FOCAL CARD CONTROLLER
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

// DARK / LIGHT THEME CONTROLLER
const htmlElement = document.documentElement;

function setTheme(theme) {
    htmlElement.setAttribute('data-bs-theme', theme);
    localStorage.setItem('portal_theme', theme);
    document.querySelectorAll('.themeIcon').forEach(icon => {
        if (theme === 'dark') {
            icon.className = 'themeIcon bi bi-sun-fill text-warning';
        } else {
            icon.className = 'themeIcon bi bi-moon-fill';
        }
    });
}

const savedTheme = localStorage.getItem('portal_theme') || 'light';
setTheme(savedTheme);

document.querySelectorAll('.themeToggleBtn').forEach(btn => {
    btn.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-bs-theme');
        setTheme(currentTheme === 'dark' ? 'light' : 'dark');
    });
});

// =========================================================
// 1. REQUESTS TAB FILTER & SEARCH ENGINE
// =========================================================
window.filterAdminRequests = function(status, btnEl) {
    const buttons = document.querySelectorAll('.admin-filter-btn');
    buttons.forEach(b => b.classList.remove('active'));
    
    if (btnEl) {
        btnEl.classList.add('active');
    } else {
        const matchBtn = document.querySelector(`.admin-filter-btn[data-filter="${status}"]`);
        if (matchBtn) matchBtn.classList.add('active');
    }

    const query = (document.getElementById('adminRequestSearch')?.value || '').toLowerCase().trim();
    const items = document.querySelectorAll('#adminRequestsBody .admin-req-row, #adminRequestsMobileList .admin-req-mobile-card');

    items.forEach(item => {
        const itemStatus = (item.getAttribute('data-status') || '').toUpperCase().trim();
        const nameText = (item.querySelector('.admin-res-name')?.innerText || '').toLowerCase();
        const docText = (item.querySelector('.admin-doc-type')?.innerText || '').toLowerCase();
        const purposeText = (item.querySelector('.admin-purpose-text')?.innerText || '').toLowerCase();

        const matchesStatus = (status === 'ALL' || itemStatus === status);
        const matchesSearch = (!query || nameText.includes(query) || docText.includes(query) || purposeText.includes(query));

        if (matchesStatus && matchesSearch) {
            item.style.display = '';
        } else {
            item.style.display = 'none';
        }
    });
};

window.searchAdminRequests = function() {
    const activeBtn = document.querySelector('.admin-filter-btn.active');
    const currentFilter = activeBtn ? (activeBtn.getAttribute('data-filter') || 'ALL') : 'ALL';
    window.filterAdminRequests(currentFilter, activeBtn);
};

// =========================================================
// 2. REACTIVATION TAB FILTER & SEARCH ENGINE
// =========================================================
window.filterAdminReactivations = function(status, btnEl) {
    const buttons = document.querySelectorAll('.admin-react-filter-btn');
    buttons.forEach(b => b.classList.remove('active'));
    
    if (btnEl) {
        btnEl.classList.add('active');
    } else {
        const matchBtn = document.querySelector(`.admin-react-filter-btn[data-filter="${status}"]`);
        if (matchBtn) matchBtn.classList.add('active');
    }

    const query = (document.getElementById('adminReactSearch')?.value || '').toLowerCase().trim();
    const items = document.querySelectorAll('#adminReactBody .admin-react-row, #adminReactMobileList .admin-react-mobile-card');

    let visibleCount = 0;

    items.forEach(item => {
        const itemStatus = (item.getAttribute('data-status') || '').toUpperCase().trim();
        const nameText = (item.querySelector('.admin-res-name')?.innerText || '').toLowerCase();
        const userText = (item.querySelector('.admin-user-name')?.innerText || '').toLowerCase();

        const matchesStatus = (status === 'ALL' || itemStatus === status);
        const matchesSearch = (!query || nameText.includes(query) || userText.includes(query));

        if (matchesStatus && matchesSearch) {
            item.style.display = '';
            visibleCount++;
        } else {
            item.style.display = 'none';
        }
    });

    const emptyRow = document.getElementById('emptyAdminReactRow');
    if (emptyRow) {
        emptyRow.style.display = (visibleCount === 0) ? '' : 'none';
    }
};

window.searchAdminReactivations = function() {
    const activeBtn = document.querySelector('.admin-react-filter-btn.active');
    const currentFilter = activeBtn ? (activeBtn.getAttribute('data-filter') || 'ALL') : 'ALL';
    window.filterAdminReactivations(currentFilter, activeBtn);
};

// =========================================================
// 3. USER DIRECTORY TAB FILTER & SEARCH ENGINE
// =========================================================
window.filterAdminUsers = function(status, btnEl) {
    const buttons = document.querySelectorAll('.admin-user-filter-btn');
    buttons.forEach(b => b.classList.remove('active'));
    
    if (btnEl) {
        btnEl.classList.add('active');
    } else {
        const matchBtn = document.querySelector(`.admin-user-filter-btn[data-filter="${status}"]`);
        if (matchBtn) matchBtn.classList.add('active');
    }

    const query = (document.getElementById('adminUserSearch')?.value || '').toLowerCase().trim();
    const items = document.querySelectorAll('#adminUserBody .admin-user-row, #adminUserMobileList .admin-user-mobile-card');

    let visibleCount = 0;

    items.forEach(item => {
        const itemStatus = (item.getAttribute('data-status') || '').toUpperCase().trim();
        const itemRole = (item.getAttribute('data-role') || '').toUpperCase().trim();
        const nameText = (item.querySelector('.admin-full-name')?.innerText || '').toLowerCase();
        const userText = (item.querySelector('.admin-username')?.innerText || '').toLowerCase();

        let matchesStatus = false;
        if (status === 'ALL') matchesStatus = true;
        else if (status === 'ACTIVE') matchesStatus = (itemStatus === 'ACTIVE' || itemStatus === '');
        else if (status === 'PENDING') matchesStatus = (itemStatus === 'REACTIVATION_PENDING');
        else if (status === 'DEACTIVATED') matchesStatus = (itemStatus === 'DEACTIVATED' || itemStatus === 'BANNED');
        else if (status === 'ADMIN') matchesStatus = (itemRole === 'ADMIN');

        const matchesSearch = (!query || nameText.includes(query) || userText.includes(query));

        if (matchesStatus && matchesSearch) {
            item.style.display = '';
            visibleCount++;
        } else {
            item.style.display = 'none';
        }
    });

    const emptyRow = document.getElementById('emptyAdminUserRow');
    if (emptyRow) {
        emptyRow.style.display = (visibleCount === 0) ? '' : 'none';
    }
};

window.searchAdminUsers = function() {
    const activeBtn = document.querySelector('.admin-user-filter-btn.active');
    const currentFilter = activeBtn ? (activeBtn.getAttribute('data-filter') || 'ALL') : 'ALL';
    window.filterAdminUsers(currentFilter, activeBtn);
};

// =========================================================
// NESTED MODAL HANDLER (KEEPS 3D OVERLAY HUB OPEN AFTER ACTIONS)
// =========================================================
(function initNestedModalHandler() {
    let activeHubTabBeforeAction = null;

    document.addEventListener('show.bs.modal', function (event) {
        const modalEl = event.target;
        if (modalEl.id !== 'overlayHubModal') {
            const hubEl = document.getElementById('overlayHubModal');
            if (hubEl && (hubEl.classList.contains('show') || hubEl.style.display === 'block')) {
                activeHubTabBeforeAction = typeof currentOverlayTab !== 'undefined' ? currentOverlayTab : 0;
            }
        }
    });

    document.addEventListener('hidden.bs.modal', function (event) {
        const modalEl = event.target;
        if (modalEl.id !== 'overlayHubModal' && activeHubTabBeforeAction !== null) {
            const savedTab = activeHubTabBeforeAction;
            activeHubTabBeforeAction = null;
            
            setTimeout(() => {
                openOverlayHub(savedTab);
            }, 100);
        }
    });
})();

// INITIALIZE LISTENERS
document.addEventListener('DOMContentLoaded', () => {
    detectSwipe('overlay3dCarousel', rotateOverlayHub);
    detectSwipe('dev3dCarousel', rotateDev3d);

    if (typeof VanillaTilt !== 'undefined') {
        VanillaTilt.init(document.querySelectorAll(".dev-card-inner"), {
            max: 18,
            speed: 800,
            glare: true,
            "max-glare": 0.35,
            perspective: 1000,
            scale: 1.04
        });
    }

    updateDev3dCarousel();
    updateFocalCards();
});