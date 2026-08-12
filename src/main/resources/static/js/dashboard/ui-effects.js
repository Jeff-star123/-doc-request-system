// =========================================================
// 3D REVOLVING OVERLAY HUB & UI EFFECTS CONTROLLER
// =========================================================

let currentOverlayTab = 0;
let overlayHubModal = null;

// Failsafe Developer Data Array to prevent Uncaught ReferenceErrors on cached client scripts [2]
const devTeamData = [
    { name: "Jeffrey M. Serrano Jr.", img: "https://cdn.phototourl.com/free/2026-08-09-94b8e222-4932-4fa2-98dd-313cb0c52169.png" },
    { name: "Jalayahay, Jessa Mae P.", img: "https://cdn.phototourl.com/free/2026-08-09-177e81e4-3ffb-4138-99e8-69ee1278c9b6.jpg" },
    { name: "Mines, Manzor M.", img: "https://cdn.phototourl.com/free/2026-08-09-5739fb3b-103b-46e2-a083-dacf4189b199.jpg" },
    { name: "Gutierrez, Rovil B.", img: "https://cdn.phototourl.com/free/2026-08-09-1f1dd251-d61d-40b3-9969-e12b6db7e10d.jpg" },
    { name: "Prescillas, Ej Y.", img: "https://cdn.phototourl.com/free/2026-08-09-9e4f218c-64ac-4a91-9c67-4353e6527b17.jpg" },
    { name: "Kurt Bactat Russel", img: "https://cdn.phototourl.com/free/2026-08-09-8e0595e4-015c-452c-b33e-6cdd247f82d7.jpg" },
    { name: "Tyrone James Oribiada", img: "https://cdn.phototourl.com/free/2026-08-09-3b99cbe0-e745-453f-9156-29fb8d4cea10.jpg" }
];

// Open Overlay Hub Modal at specific Tab Index
function openOverlayHub(tabIndex) {
    if (!overlayHubModal) {
        const modalEl = document.getElementById('overlayHubModal');
        if (modalEl) overlayHubModal = new bootstrap.Modal(modalEl);
    }
    currentOverlayTab = tabIndex;
    if (overlayHubModal) overlayHubModal.show();
    setTimeout(update3dOverlayHub, 150);
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
    const total = 4; // 0: Application, 1: History, 2: About, 3: Developers
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

// 3D Revolving Motion Math (Centered with translate(-50%, -50%))
function update3dOverlayHub() {
    const cards = document.querySelectorAll('.overlay-3d-card');
    const total = cards.length;
    if (total === 0) return;

    const isMobile = window.innerWidth <= 768;
    const spacing = isMobile ? 280 : 420;

    cards.forEach((card, index) => {
        let diff = index - currentOverlayTab;
        let absDiff = Math.abs(diff);

        // 3D Cylinder / Cover Flow Calculations
        let translateX = diff * spacing;
        let translateZ = -Math.min(absDiff * 220, 500);
        let rotateY = diff < 0 ? Math.min(Math.abs(diff) * 35, 60) : -Math.min(Math.abs(diff) * 35, 60);
        let scale = Math.max(1 - absDiff * 0.12, 0.65);
        let opacity = diff === 0 ? 1 : Math.max(0.35, 1 - absDiff * 0.4);

        // FIX: PREPEND translate(-50%, -50%) TO CENTER CARDS OVER left: 50%; top: 50%
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

    // Automatically trigger developer 3D calculations when Developers (tab 3) is active
    if (currentOverlayTab === 3) {
        setTimeout(updateDev3dCarousel, 50);
    }

    // Update Modal Tab Pill Indicators
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

    // Update Top Navigation Bar Pills
    const navPillsMap = ['pillForm', 'pillHistory', 'pillAbout', 'pillDevs'];
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

// =========================================================
// DEVELOPER 3D CAROUSEL CONTROLLER
// =========================================================
let currentDevTab = 0;

function updateDev3dCarousel() {
    const cards = document.querySelectorAll('.dev-3d-card');
    const total = cards.length;
    if (total === 0) return;

    const isMobile = window.innerWidth <= 768;
    const spacing = isMobile ? 180 : 260; // Horizontal Stage intervals

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

// =========================================================
// SYSTEM CAPABILITY EXPANDING ACCORDION CONTROLLER
// =========================================================
function selectAboutPanel(index) {
    const panels = document.querySelectorAll('.about-panel');
    panels.forEach((panel, idx) => {
        if (idx === index) {
            panel.classList.add('active');
        } else {
            panel.classList.remove('active');
        }
    });
}

// =========================================================
// BUTTERY SMOOTH TOUCH-SWIPE ENGINE FOR MOBILE
// =========================================================
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

// Initialize touch listeners once loaded
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
});

// Scroll Reveal Observer Animation
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

// Scroll-Driven Focal Card Focalizer
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

// Theme Toggle Logic
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

// Photo Lightbox Helper
function openImageModal(imageSrc, name) {
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');
    const modalTitle = document.getElementById('modalTitle');
    
    if (modal && modalImg && modalTitle) {
        modalImg.src = imageSrc;
        modalTitle.textContent = name;
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }
}

function closeImageModal() {
    const modal = document.getElementById('imageModal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
}

// Toggle Interactive Feature Cards inside About Section
function toggleFeatureCard(cardElement) {
    const allCards = document.querySelectorAll('.about-feature-card');
    allCards.forEach(card => {
        if (card !== cardElement) {
            card.classList.remove('active');
        }
    });
    cardElement.classList.toggle('active');
}