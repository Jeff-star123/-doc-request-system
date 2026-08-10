// =========================================================
// UI EFFECTS, THEME TOGGLE, CAROUSEL & LIGHTBOX MODULE
// =========================================================

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

// Single Developer Carousel Scroll Controls
function scrollDevs(direction) {
    const carousel = document.getElementById('devCarousel');
    if (carousel) {
        carousel.scrollBy({ left: direction * carousel.clientWidth, behavior: 'smooth' });
    }
}

// Developer Counter Update Listener
const devCarousel = document.getElementById('devCarousel');
const devCounter = document.getElementById('devCounter');
if (devCarousel && devCounter) {
    devCarousel.addEventListener('scroll', () => {
        const totalDevs = 7;
        const index = Math.round(devCarousel.scrollLeft / devCarousel.clientWidth) + 1;
        devCounter.innerText = `Dev ${Math.min(Math.max(index, 1), totalDevs)} of ${totalDevs}`;
    });
}

// PC Mouse Drag-to-Scroll for Developer Carousel
(function initCarouselDragScroll() {
    const carousel = document.getElementById('devCarousel');
    if (!carousel) return;

    let isDown = false;
    let startX;
    let scrollLeft;

    carousel.addEventListener('mousedown', (e) => {
        isDown = true;
        carousel.classList.add('is-dragging');
        startX = e.pageX - carousel.offsetLeft;
        scrollLeft = carousel.scrollLeft;
    });

    carousel.addEventListener('mouseleave', () => {
        isDown = false;
        carousel.classList.remove('is-dragging');
    });

    carousel.addEventListener('mouseup', () => {
        isDown = false;
        carousel.classList.remove('is-dragging');
    });

    carousel.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - carousel.offsetLeft;
        const walk = (x - startX) * 1.8;
        carousel.scrollLeft = scrollLeft - walk;
    });
})();

// Photo Lightbox Modal Helpers
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