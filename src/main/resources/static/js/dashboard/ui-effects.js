// =========================================================
// 3D REVOLVING OVERLAY HUB & UI EFFECTS CONTROLLER
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

// 3D Revolving Motion Math (Matching Video 2 ani.mp4)
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

        card.style.transform = `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`;
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
// SPOTLIGHT & QUEUE DEVELOPER SHOWCASE CONTROLLER
// =========================================================
const devTeamData = [
    {
        name: "Jeffrey M. Serrano Jr.",
        role: "Head Developer",
        badge: "★ Lead Dev",
        badgeClass: "bg-primary text-white",
        desc: "Architecture, liveness detection, core logic design, and overall system implementation.",
        img: "https://cdn.phototourl.com/free/2026-08-09-94b8e222-4932-4fa2-98dd-313cb0c52169.png"
    },
    {
        name: "Jalayahay, Jessa Mae P.",
        role: "Assistant Developer",
        badge: "Assistant Dev",
        badgeClass: "bg-info text-dark",
        desc: "Assists with development workflows, UI refinements, and feature integration.",
        img: "https://cdn.phototourl.com/free/2026-08-09-177e81e4-3ffb-4138-99e8-69ee1278c9b6.jpg"
    },
    {
        name: "Mines, Manzor M.",
        role: "Project Presentor",
        badge: "Presentor",
        badgeClass: "bg-secondary text-white",
        desc: "Leads system demonstrations, academic project pitch presentation, and technical showcase.",
        img: "https://cdn.phototourl.com/free/2026-08-09-5739fb3b-103b-46e2-a083-dacf4189b199.jpg"
    },
    {
        name: "Gutierrez, Rovil B.",
        role: "Documentation",
        badge: "Documentation",
        badgeClass: "bg-secondary text-white",
        desc: "Responsible for preparing project technical documentation, system specifications, and compliance records.",
        img: "https://cdn.phototourl.com/free/2026-08-09-1f1dd251-d61d-40b3-9969-e12b6db7e10d.jpg"
    },
    {
        name: "Prescillas, Ej Y.",
        role: "Documentation",
        badge: "Documentation",
        badgeClass: "bg-secondary text-white",
        desc: "Manages project reporting, system requirements writing, and process workflow charts.",
        img: "https://cdn.phototourl.com/free/2026-08-09-9e4f218c-64ac-4a91-9c67-4353e6527b17.jpg"
    },
    {
        name: "Kurt Bactat Russel",
        role: "Documentation",
        badge: "Documentation",
        badgeClass: "bg-secondary text-white",
        desc: "Assists with software user manual development, academic case studies, and compliance checks.",
        img: "https://cdn.phototourl.com/free/2026-08-09-8e0595e4-015c-452c-b33e-6cdd247f82d7.jpg"
    },
    {
        name: "Tyrone James Oribiada",
        role: "Documentation",
        badge: "Documentation",
        badgeClass: "bg-secondary text-white",
        desc: "Maintains visual assets, final project formatting, and documentation archives.",
        img: "https://cdn.phototourl.com/free/2026-08-09-3b99cbe0-e745-453f-9156-29fb8d4cea10.jpg"
    }
];

let activeDevIndex = 0;

function selectSpotlightDev(index) {
    if (index < 0 || index >= devTeamData.length) return;
    activeDevIndex = index;
    const dev = devTeamData[index];

    const img = document.getElementById('featuredDevImg');
    const badge = document.getElementById('featuredDevBadge');
    const name = document.getElementById('featuredDevName');
    const role = document.getElementById('featuredDevRole');
    const desc = document.getElementById('featuredDevDesc');
    const counter = document.getElementById('devSpotlightCounter');

    if (img && name && role && desc) {
        img.style.opacity = '0.3';
        img.style.transform = 'scale(1.08)';

        setTimeout(() => {
            img.src = dev.img;
            name.innerText = dev.name;
            role.innerText = dev.role;
            desc.innerText = dev.desc;

            if (badge) {
                badge.className = `badge ${dev.badgeClass} fw-bold text-uppercase mb-2`;
                badge.innerText = dev.badge;
            }

            if (counter) {
                counter.innerText = `Developer ${index + 1} of ${devTeamData.length}`;
            }

            img.style.opacity = '1';
            img.style.transform = 'scale(1)';
        }, 150);
    }

    const items = document.querySelectorAll('.dev-queue-item');
    items.forEach((item, idx) => {
        if (idx === index) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

function triggerFeaturedLightbox() {
    const dev = devTeamData[activeDevIndex];
    if (dev) {
        openImageModal(dev.img, dev.name);
    }
}

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