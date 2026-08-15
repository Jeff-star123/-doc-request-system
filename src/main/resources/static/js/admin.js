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

// Dynamic Trilingual Language Detector for Admin AI
function detectAdminLanguage(query) {
    const q = query.toLowerCase().trim();
    
    const tagalogTokens = ['ano', 'paano', 'kailan', 'sino', 'magkano', 'bakit', 'saan', 'ba', 'ko', 'mo', 'nito', 'ito', 'to', 'mga', 'kailangan', 'gumawa', 'kumuha', 'naman', 'pala', 'kasi', 'po', 'opo', 'libre', 'bayad', 'may', 'wala', 'ako', 'ikaw', 'kami', 'tayo', 'sa', 'na', 'nang'];
    const englishTokens = ['what', 'how', 'when', 'who', 'why', 'where', 'can', 'should', 'would', 'is', 'are', 'the', 'this', 'that', 'which', 'does', 'do', 'requirement', 'requirements', 'need', 'apply', 'fee', 'cost', 'free', 'developer', 'developers', 'system', 'portal', 'status', 'print', 'clearance', 'approve', 'reject', 'reactivate', 'music', 'song'];

    let tagalogCount = 0;
    let englishCount = 0;

    const words = q.split(/[\s,?.!]+/);
    words.forEach(w => {
        if (tagalogTokens.includes(w)) tagalogCount++;
        if (englishTokens.includes(w)) englishCount++;
    });

    if (tagalogCount > 0 && englishCount > 0) return 'taglish';
    if (tagalogCount > 0 && englishCount === 0) return 'tagalog';
    if (englishCount > 0 && tagalogCount === 0) return 'english';

    return 'taglish';
}

function generateAdminAiResponse(query) {
    const q = query.toLowerCase().trim();
    const lang = detectAdminLanguage(query);
    const containsAny = (keywords) => keywords.some(k => q.includes(k));

    if (q === 'hi' || q === 'hello' || q === 'hey' || containsAny(['sino ka', 'who are you', 'what are you', 'magandang araw'])) {
        if (lang === 'tagalog') {
            return `
                <strong><i class="bi bi-shield-lock-fill text-warning me-1"></i> Barangay Admin AI Assistant 👋</strong><br>
                Magandang araw, Administrator! Ako ang inyong <b>Barangay Admin AI Assistant</b>.<br><br>
                💡 <b>Maaari mo akong tanungin tungkol sa:</b><br>
                • <b>Document Request Approvals:</b> Paano mag-approve, mag-reject, o mag-delete ng requests.<br>
                • <b>Account Reactivations:</b> Paano i-approve ang deactivated residents.<br>
                • <b>OCR & Biometric Security:</b> Tesseract.js ID checking at MediaPipe Face scan.<br>
                • <b>Admin Spotify Player:</b> Paano gamitin ang iTunes JSONP music player.
            `;
        } else if (lang === 'english') {
            return `
                <strong><i class="bi bi-shield-lock-fill text-warning me-1"></i> Barangay Admin AI Assistant 👋</strong><br>
                Good day, Administrator! I am your **Barangay Admin AI Assistant**.<br><br>
                💡 **You can ask me about:**<br>
                • **Document Request Approvals:** How to approve, reject, or delete applications.<br>
                • **Account Reactivations:** How to review and approve deactivated resident accounts.<br>
                • **Verification Security:** Inspecting Tesseract OCR IDs and MediaPipe 3D face scan status.<br>
                • **Admin Music Player:** How to search and stream songs using the iTunes API player.
            `;
        } else {
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
    }

    if (containsAny(['approve', 'reject', 'remarks', 'paano mag approve', 'how to approve', 'document request', 'delete'])) {
        if (lang === 'tagalog') {
            return `
                <strong><i class="bi bi-card-checklist text-primary me-1"></i> Pamamahala ng Document Requests:</strong><br>
                • <b>Pagsusuri ng ID at Selfie:</b> I-click ang <b>"View Verification"</b> button para makita ang uploaded Valid ID at Selfie ng residente.<br>
                • <b>Pag-approve:</b> I-click ang berdeng <b>Check</b> icon o <b>"Approve"</b> button.<br>
                • <b>Pag-reject:</b> I-click ang pulang <b>X</b> icon at maglagay ng dahilan.<br>
                • <b>Telegram Push:</b> Awtomatikong makakatanggap ng notification ang residente sa Telegram!
            `;
        } else if (lang === 'english') {
            return `
                <strong><i class="bi bi-card-checklist text-primary me-1"></i> Document Requests Management:</strong><br>
                • **Viewing Verification Details:** Click **"View Verification"** to inspect the uploaded Valid ID, Selfie proof, and Biometric Scan status.<br>
                • **Approving Applications:** Click the green **Check** icon or **"Approve"** button and enter optional remarks.<br>
                • **Rejecting Applications:** Click the red **X** icon and provide a required rejection reason.<br>
                • **Telegram Notification:** Residents automatically receive real-time push alerts upon decision!
            `;
        } else {
            return `
                <strong><i class="bi bi-card-checklist text-primary me-1"></i> Document Request Management:</strong><br>
                • <b>Viewing OCR & Selfie Proof:</b> I-click ang <b>"View Verification"</b> button para makita ang uploaded Valid ID at Selfie holding ID ng residente.<br>
                • <b>Approving Requests:</b> I-click ang berdeng <b>Check</b> icon o <b>"Approve"</b> button, at maglagay ng optional remarks.<br>
                • <b>Rejecting Requests:</b> I-click ang pulang <b>X</b> icon, at maglagay ng dahilan (e.g., <i>"Unclear Selfie / Invalid ID"</i>).<br>
                • <b>Telegram Alert:</b> Matapos i-approve/reject, awtomatikong makakatanggap ng notification ang residente sa Telegram!
            `;
        }
    }

    if (containsAny(['reactivate', 'reactivation', 'deactivated', 'lock out', 'unlock'])) {
        if (lang === 'tagalog') {
            return `
                <strong><i class="bi bi-person-exclamation text-warning me-1"></i> Pamamahala ng Reactivations:</strong><br>
                • Kapag nag-deactivate ang residente, kailangan nito ng <b>Admin Approval</b> para muling makapasok.<br>
                • Makikita ang mga humihingi ng reactivation sa <b>"Pending Account Reactivation Requests"</b> card.<br>
                • I-click ang <b>"Approve"</b> button para ibalik ang access ng residente.
            `;
        } else if (lang === 'english') {
            return `
                <strong><i class="bi bi-person-exclamation text-warning me-1"></i> Account Reactivation Management:</strong><br>
                • When a resident deactivates their account, manual **Admin Approval** is required to restore access.<br>
                • View pending requests under the **"Pending Account Reactivation Requests"** section.<br>
                • Click **"Approve"** to restore resident portal access immediately.
            `;
        } else {
            return `
                <strong><i class="bi bi-person-exclamation text-warning me-1"></i> Account Reactivation Management:</strong><br>
                • Kapag nag-deactivate ang isang residente ng kanyang account, kailangan nito ng <b>Admin Approval</b> para muling maka-login.<br>
                • Makikita ang mga humihingi ng reactivation sa <b>"Pending Account Reactivation Requests"</b> card o tab.<br>
                • I-click ang <b>"Approve"</b> button para ibalik ang access ng residente!
            `;
        }
    }

    if (containsAny(['ocr', 'face scan', 'liveness', 'tesseract', 'mediapipe', 'verification', 'id check'])) {
        if (lang === 'tagalog') {
            return `
                <strong><i class="bi bi-shield-check text-success me-1"></i> Sistema ng Verification:</strong><br>
                • <b>Tesseract OCR:</b> Awtomatikong binabasa ang text sa ID para makumpirma kung National ID, School ID, Driver's License, UMID, o Barangay ID ito.<br>
                • <b>MediaPipe Face Scan:</b> Sinisigurado na totoong tao ang nag-aapply sa pamamagitan ng 3D head pose tracking (Turn Left/Right).
            `;
        } else if (lang === 'english') {
            return `
                <strong><i class="bi bi-shield-check text-success me-1"></i> Identity Verification System:</strong><br>
                • **Tesseract OCR:** Analyzes text on uploaded IDs in-browser to confirm matching category keywords.<br>
                • **MediaPipe Liveness Scan:** Enforces real-time 3D facial gesture detection (Straight, Turn Left, Turn Right) to prevent proxy/fraudulent submissions.
            `;
        } else {
            return `
                <strong><i class="bi bi-shield-check text-success me-1"></i> Identity Verification System:</strong><br>
                • <b>Tesseract OCR:</b> Awtomatikong binabasa ang text sa uploaded ID para makumpirma kung National ID, School ID, Driver's License, UMID, o Barangay ID ito.<br>
                • <b>MediaPipe Liveness Scan:</b> Sinisigurado ng system na buhay at totoong tao ang nag-aapply sa pamamagitan ng 3D head pose tracking (Left/Right turn).
            `;
        }
    }

    if (containsAny(['spam', 'deactivate user', 'ban', 'user directory', 'anti-spam'])) {
        if (lang === 'tagalog') {
            return `
                <strong><i class="bi bi-people-fill text-info me-1"></i> User Directory at Anti-Spam:</strong><br>
                • Makikita ang lahat ng rehistradong accounts sa <b>"Registered Users Directory"</b>.<br>
                • Kung may residente na nagi-spam ng requests, i-click ang <b>"Deactivate"</b> button sa tabi ng kanyang account para i-lockout siya.
            `;
        } else if (lang === 'english') {
            return `
                <strong><i class="bi bi-people-fill text-info me-1"></i> User Directory & Anti-Spam Controls:</strong><br>
                • Review all registered accounts under the **"Registered Users Directory"** tab.<br>
                • If a user spams document print requests or violates rules, click **"Deactivate"** next to their account to lock them out immediately.
            `;
        } else {
            return `
                <strong><i class="bi bi-people-fill text-info me-1"></i> User Directory & Anti-Spam Controls:</strong><br>
                • Makikita ang lahat ng rehistradong accounts sa <b>"Registered Users Directory"</b> tab.<br>
                • Kung may resident na nagi-spam ng requests o nag-violate ng security rules, i-click ang <b>"Deactivate"</b> button sa tabi ng kanyang account para i-lockout siya.
            `;
        }
    }

    if (containsAny(['music', 'song', 'spotify', 'itunes', 'audio player', 'tugtog', 'kanta'])) {
        if (lang === 'tagalog') {
            return `
                <strong><i class="bi bi-spotify text-success me-1"></i> Admin Spotify Music Player:</strong><br>
                • I-click ang <b>"Search & Play Music"</b> button sa itaas ng Admin Console.<br>
                • I-type ang pangalan ng kanta o artist (hal. <i>"Dati"</i> o <i>"Taylor Swift"</i>) para mag-search gamit ang Apple iTunes API.<br>
                • I-click ang <b>Play</b> button para mag-stream ng 30-second audio preview nang libre!
            `;
        } else if (lang === 'english') {
            return `
                <strong><i class="bi bi-spotify text-success me-1"></i> Admin Spotify Music Player:</strong><br>
                • Click **"Search & Play Music"** at the top of your Admin Console.<br>
                • Type any track title or artist (e.g., *"Taylor Swift"*, *"Skusta"*) to search via Apple iTunes API.<br>
                • Click **Play** to stream 30-second high-quality audio previews directly on your dashboard!
            `;
        } else {
            return `
                <strong><i class="bi bi-spotify text-success me-1"></i> Admin Spotify Music Player:</strong><br>
                • I-click ang <b>"Search & Play Music"</b> button sa itaas ng Admin Console.<br>
                • Type any song title or artist name para mag-search sa milyun-milyong kanta gamit ang Apple iTunes API.<br>
                • I-click ang <b>Play</b> para makinig sa 30s audio preview nang libre habang nag-aapprove ng requests!
            `;
        }
    }

    if (containsAny(['developer', 'creator', 'who made', 'sino gumawa', 'bsit'])) {
        if (lang === 'tagalog') {
            return `
                <strong><i class="bi bi-code-slash text-primary me-1"></i> BSIT Project Team:</strong><br>
                • <b>Lead Developer:</b> Jeffrey M. Serrano Jr.<br>
                • <b>Assistant Developer:</b> Jalayahay, Jessa Mae P.<br>
                • <b>Presentor:</b> Mines, Manzor M.<br>
                • <b>Documentation Team:</b> Gutierrez, Rovil B., Prescillas, Ej Y., Kurt Bactat Russel, Tyrone James Oribiada.
            `;
        } else if (lang === 'english') {
            return `
                <strong><i class="bi bi-code-slash text-primary me-1"></i> System Developers (BSIT Project Team):</strong><br>
                • **Lead Developer:** Jeffrey M. Serrano Jr.<br>
                • **Assistant Developer:** Jalayahay, Jessa Mae P.<br>
                • **Project Presentor:** Mines, Manzor M.<br>
                • **Documentation Team:** Gutierrez, Rovil B., Prescillas, Ej Y., Kurt Bactat Russel, Tyrone James Oribiada.<br>
                • Developed as an academic capstone prototype for local government service automation.
            `;
        } else {
            return `
                <strong><i class="bi bi-code-slash text-primary me-1"></i> BSIT Project Team:</strong><br>
                • <b>Lead Developer:</b> Jeffrey M. Serrano Jr.<br>
                • <b>Assistant Developer:</b> Jalayahay, Jessa Mae P.<br>
                • <b>Presentor:</b> Mines, Manzor M.<br>
                • <b>Documentation Team:</b> Gutierrez, Rovil B., Prescillas, Ej Y., Kurt Bactat Russel, Tyrone James Oribiada.
            `;
        }
    }

    if (lang === 'tagalog') {
        return `
            <strong><i class="bi bi-exclamation-triangle-fill text-warning me-1"></i> Admin AI Scope Notice:</strong><br>
            Administrator! Ako ang inyong <b>Barangay Admin AI Assistant</b> na nakadisenyo para tumulong sa pamamahala ng portal.<br><br>
            💡 <b>Maaari mo akong tanungin tungkol sa:</b><br>
            • "Paano mag-approve o mag-reject ng requests?"<br>
            • "Paano ang Account Reactivations?"<br>
            • "Paano gumagana ang OCR at Biometric Liveness Check?"<br>
            • "Paano gamitin ang Admin Music Player?"
        `;
    } else if (lang === 'english') {
        return `
            <strong><i class="bi bi-exclamation-triangle-fill text-warning me-1"></i> Admin AI Scope Notice:</strong><br>
            Administrator! I am your **Barangay Admin AI Assistant**.<br><br>
            💡 **You may ask me about:**<br>
            • "How do I approve or reject document applications?"<br>
            • "How do account reactivations work?"<br>
            • "How does OCR and Biometric Face Liveness verification work?"<br>
            • "How do I use the Admin Music Player?"
        `;
    } else {
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

// =========================================================
// SPOTIFY-INSPIRED ADMIN MUSIC PLAYER ENGINE (APPLE ITUNES JSONP)
// =========================================================
(function initAdminMusicOverlayPlayer() {
    const audioEngine = document.getElementById('adminAudioEngine');
    const searchInput = document.getElementById('musicModalSearchInput');
    const searchBtn = document.getElementById('btnModalSearchMusic');
    const resultsList = document.getElementById('musicSearchResultsList');
    const activePlayerBox = document.getElementById('modalActivePlayerBox');
    
    const modalCoverImg = document.getElementById('modalCoverImg');
    const modalActiveTitle = document.getElementById('modalActiveTitle');
    const modalActiveArtist = document.getElementById('modalActiveArtist');
    const btnModalPlayPause = document.getElementById('btnModalPlayPause');
    const modalPlayIcon = document.getElementById('modalPlayIcon');

    const mainTrackTitle = document.getElementById('musicTrackTitle');
    const mainArtistTitle = document.getElementById('musicArtistTitle');
    const mainCoverImg = document.getElementById('musicCoverImg');
    const btnMainPlayPause = document.getElementById('btnMainPlayPause');
    const mainPlayIcon = document.getElementById('mainPlayIcon');

    const progressBar = document.getElementById('musicProgressBar');
    const currentTimeEl = document.getElementById('musicCurrentTime');
    const totalTimeEl = document.getElementById('musicTotalTime');
    const btnMainPrev = document.getElementById('btnMainPrev');
    const btnMainNext = document.getElementById('btnMainNext');

    if (!resultsList || !audioEngine) return;

    const fallbackCover = "https://cdn-icons-png.flaticon.com/512/3844/3844724.png";

    // NO DEFAULT PLAYLIST - Starts completely empty on page load!
    let playlist = [];
    let currentTrackIndex = -1;

    function loadTrack(index) {
        if (index < 0 || index >= playlist.length) return;
        currentTrackIndex = index;
        const song = playlist[currentTrackIndex];

        if (!song || !song.audio) return;

        // Enable Play button
        if (btnMainPlayPause) btnMainPlayPause.disabled = false;

        audioEngine.src = song.audio;
        audioEngine.play().then(() => {
            updatePlayIcons(true);
        }).catch(e => console.log("Audio Playback Notice:", e));

        // Update Modal UI
        if (modalActiveTitle) modalActiveTitle.innerText = song.title;
        if (modalActiveArtist) modalActiveArtist.innerText = song.artist;
        if (modalCoverImg) {
            modalCoverImg.src = song.cover || fallbackCover;
            modalCoverImg.onerror = function() { this.src = fallbackCover; };
        }
        if (activePlayerBox) activePlayerBox.classList.remove('d-none');

        // Update Dashboard Compact Player Bar
        if (mainTrackTitle) mainTrackTitle.innerText = song.title;
        if (mainArtistTitle) mainArtistTitle.innerText = song.artist;
        if (mainCoverImg) {
            mainCoverImg.src = song.cover || fallbackCover;
            mainCoverImg.onerror = function() { this.src = fallbackCover; };
        }
    }

    function updatePlayIcons(isPlaying) {
        const iconClass = isPlaying ? "bi bi-pause-fill fs-4" : "bi bi-play-fill fs-4";
        if (mainPlayIcon) mainPlayIcon.className = iconClass;
        if (modalPlayIcon) modalPlayIcon.className = iconClass;
    }

    function togglePlayPause() {
        if (!audioEngine.src) return;
        if (audioEngine.paused) {
            audioEngine.play().then(() => updatePlayIcons(true)).catch(e => console.log(e));
        } else {
            audioEngine.pause();
            updatePlayIcons(false);
        }
    }

    btnMainPlayPause?.addEventListener('click', togglePlayPause);
    btnModalPlayPause?.addEventListener('click', togglePlayPause);

    btnMainPrev?.addEventListener('click', () => {
        let prevIndex = currentTrackIndex - 1;
        if (prevIndex < 0) prevIndex = playlist.length - 1;
        loadTrack(prevIndex);
    });

    btnMainNext?.addEventListener('click', () => {
        let nextIndex = currentTrackIndex + 1;
        if (nextIndex >= playlist.length) nextIndex = 0;
        loadTrack(nextIndex);
    });

    // Time Seek Bar Synchronization
    audioEngine.addEventListener('timeupdate', () => {
        if (audioEngine.duration && progressBar) {
            const percent = (audioEngine.currentTime / audioEngine.duration) * 100;
            progressBar.value = percent;

            const curMins = Math.floor(audioEngine.currentTime / 60);
            const curSecs = Math.floor(audioEngine.currentTime % 60);
            if (currentTimeEl) currentTimeEl.innerText = `${curMins}:${curSecs < 10 ? '0' : ''}${curSecs}`;

            const durMins = Math.floor(audioEngine.duration / 60);
            const durSecs = Math.floor(audioEngine.duration % 60);
            if (totalTimeEl) totalTimeEl.innerText = `${durMins}:${durSecs < 10 ? '0' : ''}${durSecs}`;
        }
    });

    audioEngine.addEventListener('ended', () => {
        updatePlayIcons(false);
    });

    progressBar?.addEventListener('input', () => {
        if (audioEngine.duration) {
            audioEngine.currentTime = (progressBar.value / 100) * audioEngine.duration;
        }
    });

    function renderResults(songs) {
        resultsList.innerHTML = '';
        if (!songs || songs.length === 0) {
            resultsList.innerHTML = `
                <div class="p-4 text-center text-secondary">
                    <i class="bi bi-search fs-3 d-block mb-2 text-primary opacity-50"></i>
                    <h6 class="fw-bold mb-1">No Music Found</h6>
                    <small>Type a song title or artist name above and click Search.</small>
                </div>`;
            const badgeEl = document.getElementById('searchCountBadge');
            if (badgeEl) badgeEl.innerText = `0 Tracks`;
            return;
        }

        const badgeEl = document.getElementById('searchCountBadge');
        if (badgeEl) badgeEl.innerText = `${songs.length} Tracks Found`;

        songs.forEach((song, idx) => {
            const card = document.createElement('div');
            card.className = "d-flex align-items-center justify-content-between p-3 rounded-3 bg-body border border-secondary border-opacity-20 shadow-xs hover-shadow transition-all";
            card.style.cursor = "pointer";

            const imgSrc = song.cover || fallbackCover;

            card.innerHTML = `
                <div class="d-flex align-items-center gap-3 overflow-hidden">
                    <img src="${imgSrc}" class="rounded-2 flex-shrink-0" style="width: 52px; height: 52px; object-fit: cover;" onerror="this.onerror=null; this.src='${fallbackCover}';">
                    <div class="overflow-hidden">
                        <h6 class="fw-bold mb-0 text-body text-truncate" style="max-width: 380px;">${song.title}</h6>
                        <small class="text-secondary text-truncate d-block" style="max-width: 380px;">${song.artist}</small>
                    </div>
                </div>
                <button type="button" class="btn btn-sm btn-primary rounded-pill px-3 fw-bold flex-shrink-0">
                    <i class="bi bi-play-fill me-1"></i> Play
                </button>
            `;

            card.addEventListener('click', () => {
                playlist = songs;
                loadTrack(idx);
            });
            resultsList.appendChild(card);
        });
    }

    // 100% BULLETPROOF APPLE ITUNES JSONP SEARCH ENGINE
    function searchSongsJsonp(query) {
        if (!query) return;
        if (searchBtn) searchBtn.innerHTML = `<div class="spinner-border spinner-border-sm" role="status"></div>`;

        const callbackName = 'itunesJsonpCb_' + Date.now();

        window[callbackName] = function(data) {
            if (searchBtn) searchBtn.innerHTML = `Search`;

            if (data && data.results && data.results.length > 0) {
                const songs = data.results.map(item => ({
                    title: item.trackName || item.collectionName || "Song Track",
                    artist: item.artistName || "Artist",
                    cover: item.artworkUrl100 ? item.artworkUrl100.replace('100x100', '300x300') : fallbackCover,
                    audio: item.previewUrl
                })).filter(s => s.audio);

                renderResults(songs);
            } else {
                renderResults([]);
            }

            try { delete window[callbackName]; } catch (e) {}
            if (scriptTag && scriptTag.parentNode) scriptTag.parentNode.removeChild(scriptTag);
        };

        const scriptTag = document.createElement('script');
        scriptTag.src = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=10&callback=${callbackName}`;
        scriptTag.onerror = function() {
            if (searchBtn) searchBtn.innerHTML = `Search`;
            renderResults([]);
        };

        document.body.appendChild(scriptTag);
    }

    searchBtn?.addEventListener('click', () => {
        const query = searchInput?.value.trim();
        if (query) searchSongsJsonp(query);
    });

    searchInput?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const query = searchInput?.value.trim();
            if (query) searchSongsJsonp(query);
        }
    });

    // Initial state: Display search prompt in results list
    resultsList.innerHTML = `
        <div class="p-4 text-center text-secondary">
            <i class="bi bi-search fs-3 d-block mb-2 text-primary opacity-50"></i>
            <h6 class="fw-bold mb-1">Search Your Favorite Music</h6>
            <small>Type any song title or artist name above and click Search.</small>
        </div>`;
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