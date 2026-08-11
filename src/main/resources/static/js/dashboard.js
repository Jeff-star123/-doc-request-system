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

// =========================================================
// DIRECT EMBEDDED DASHBOARD AI ASSISTANT ENGINE
// =========================================================
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
    userQuestionText.innerHTML = `<i class="bi bi-person-fill text-primary me-1"></i> You asked: "${query}"`;
    responseBox.classList.remove('d-none');

    aiAnswerText.innerHTML = `
        <div class="d-flex align-items-center gap-2 py-1">
            <div class="spinner-border spinner-border-sm text-primary" role="status"></div>
            <span class="text-muted">AI is generating response...</span>
        </div>
    `;

    setTimeout(() => {
        const answer = generateBarangayAiResponse(query);
        aiAnswerText.innerHTML = answer;
    }, 600);
}

function generateBarangayAiResponse(query) {
    const q = query.toLowerCase().trim();

    // Helper function to check if query contains any Tagalog or English keywords
    const containsAny = (keywords) => keywords.some(k => q.includes(k));

    // Intent 1: System Identification / "What is this" / "Ano 'to" / "Para saan 'to" / "Sino ka"
    if (containsAny([
        'what is this', 'ano to', "ano 'to", 'ano ito', 'para saan to', "para saan 'to", 'para saan ito',
        'what is this system', 'ano tong system', 'ano itong system', 'what is this portal', 'what is this website',
        'sino ka', 'who are you', 'what can you do', 'anong magagawa mo', 'anong ginagawa nito', 'tungkol saan to', "tungkol saan 'to",
        'about this system', 'purpose of this'
    ])) {
        return `
            <strong><i class="bi bi-info-circle-fill text-primary me-1"></i> Barangay Bulsa-Korapot Request System & AI Assistant:</strong><br>
            • <b>Ano / Para Saan itong System?</b> Ito ay isang automated online portal para sa mga residente ng Barangay Bulsa-Korapot upang kumuha ng mga dokumento (Clearance, Residency, Indigency) nang hindi na kailangang pumila sa barangay hall.<br>
            • <b>Sino / Anong ginagawa ng AI Chatbot?</b> Ako ang inyong <b>Barangay AI Assistant</b>! Tumutulong ako sa pag-check ng mga kailangan sa dokumento, pag-setup ng Telegram bot alerts, pagpapaliwanag ng biometric face scan, at pag-navigate sa portal.<br>
            • <b>Academic Prototype Note:</b> Developed as a BSIT program project prototype for digital government service automation.<br><br>
            👉 <i>Maaari mong itanong sa akin: <b>"Ano ang kailangan sa Clearance?"</b> o <b>"Paano ang Telegram Bot?"</b></i>
        `;
    }

    // Intent 2: Developer / Creator / BSIT Project Info ("Sino gumawa nito")
    if (containsAny([
        'developer', 'creator', 'who made', 'who built', 'sino gumawa', 'sinong gumawa', 'sino nag-code', 'sino nag code',
        'sino nag-build', 'sinong dev', 'mga gumawa', 'jeffrey', 'bsit team', 'team', 'author'
    ])) {
        return `
            <strong><i class="bi bi-code-slash text-primary me-1"></i> BSIT Project Information (Mga Gumawa):</strong><br>
            • <b>Lead Developer:</b> Jeffrey M. Serrano Jr.<br>
            • <b>Assistant Developer:</b> Jalayahay, Jessa Mae P.<br>
            • <b>Presentor:</b> Mines, Manzor M.<br>
            • <b>Documentation Team:</b> Gutierrez, Rovil B., Prescillas, Ej Y., Kurt Bactat Russel, Tyrone James Oribiada.<br>
            • Built as an academic prototype for local barangay document automation and biometric verification.
        `;
    }

    // Intent 3: Requirements, Clearances & Certificates ("Kailangan", "Paano kumuha")
    if (containsAny([
        'requirement', 'clearance', 'residency', 'indigency', 'apply', 'certificate', 'kailangan', 'mga kailangan',
        'anong kailangan', 'paano kumuha', 'paano mag-apply', 'paano mag apply', 'paano kumuha ng clearance'
    ])) {
        return `
            <strong><i class="bi bi-file-earmark-check-fill text-success me-1"></i> Document Requirements / Mga Kailangan:</strong><br>
            • <b>Barangay Clearance:</b> Requires valid ID (National ID, Student ID, Driver's License, UMID, o Barangay ID) at Selfie na hawak ang ID.<br>
            • <b>Certificate of Residency:</b> Requires proof of address o valid ID na nakasaad ang Barangay Bulsa-Korapot.<br>
            • <b>Certificate of Indigency:</b> Para sa tulong pampinansyal o iskolarsip; valid ID kinakailangan.<br><br>
            👉 <i>Maaari kang mag-apply sa pamamagitan ng pag-click ng <b>"Apply Document"</b> sa itaas!</i>
        `;
    } 

    // Intent 4: Telegram Setup, Bot, Chat ID & OTP ("Paano mag telegram")
    if (containsAny([
        'telegram', 'bot', 'chat id', 'notification', 'otp', 'alert', 'mga alert', 'paano mag telegram'
    ])) {
        return `
            <strong><i class="bi bi-telegram text-primary me-1"></i> Telegram Notification Bot Setup:</strong><br>
            1. Mag-open ng Telegram at hanapin ang <a href="https://t.me/userinfobot" target="_blank" class="fw-bold text-accent-link">@userinfobot</a> para makuha ang iyong Chat ID.<br>
            2. Buksan ang <a href="https://t.me/BrgyDocRequestBot" target="_blank" class="fw-bold text-accent-link">@BrgyDocRequestBot</a> at i-tap ang <b>START</b>.<br>
            3. Ilagay ang iyong Chat ID sa <b>Settings</b> page para makatanggap ng instant approval o rejection notification messages!
        `;
    } 

    // Intent 5: Biometric Scan, Face Scan & Liveness Verification ("Mukha", "Face scan")
    if (containsAny([
        'face', 'liveness', 'scan', 'biometric', 'camera', 'kamera', 'verification', 'mukha', 'litrato'
    ])) {
        return `
            <strong><i class="bi bi-shield-lock-fill text-info me-1"></i> Biometric Liveness Verification (Face Scan):</strong><br>
            • Ang portal ay gumagamit ng <b>MediaPipe FaceMesh landmark tracking</b> para sa seguridad ng residente.<br>
            • <b>Step 1:</b> Tumingin nang diretso sa bilog na green guide.<br>
            • <b>Step 2:</b> Iling nang dahan-dahan ang ulo sa KALIWA (LEFT).<br>
            • <b>Step 3:</b> Iling ang ulo sa KANAN (RIGHT) para ma-pass ang verification.
        `;
    } 

    // Intent 6: Status, Tracking, Printing & Approval ("Kailan makukuha", "Print")
    if (containsAny([
        'status', 'history', 'track', 'print', 'approve', 'reject', 'kailan makukuha', 'kailan ma-approve', 'mga request'
    ])) {
        return `
            <strong><i class="bi bi-clock-history text-warning me-1"></i> Request Tracking & Printing (Pag-check at Print):</strong><br>
            • I-click ang <b>"Request History"</b> card o tab sa itaas para makita ang live updates.<br>
            • Kapag APPROVED na ang request, lalabas ang kulay berdeng <b>"Print"</b> button para mai-print ang opisyal na dokumento.<br>
            • Makakatanggap ka rin ng alert sa Telegram kapag na-review na ng Admin ang iyong request.
        `;
    }

    // Intent 7: Fees, Price, Payment & Costs ("Magkano", "Libre ba", "Bayad")
    if (containsAny([
        'fee', 'price', 'cost', 'pay', 'payment', 'free', 'magkano', 'may bayad', 'libre ba', 'magkano magbayad'
    ])) {
        return `
            <strong><i class="bi bi-cash-stack text-success me-1"></i> Document Fees & Payments (Bayad):</strong><br>
            • Ang paghiling ng dokumento gamit ang <b>Barangay Request Portal</b> ay 100% <b>LIBRE (FREE)</b> para sa pampublikong pagsubok.<br>
            • Walang anumang hidden charges sa pag-apply online.
        `;
    }

    // Intent 8: Account, Settings, Password, Deactivate & Reactivate ("Palitan ang password")
    if (containsAny([
        'account', 'setting', 'password', 'deactivate', 'reactivate', 'profile', 'palitan', 'nakalimutan'
    ])) {
        return `
            <strong><i class="bi bi-gear-fill text-primary me-1"></i> Account & Settings Management:</strong><br>
            • I-click ang <b>"Settings"</b> sa navigation bar para i-update ang pangalan, Username, o Telegram Chat ID.<br>
            • Maaari mo ring palitan ang iyong Password o i-deactivate muna ang iyong account.<br>
            • <i>Tandaan: Ang pag-reactivate ng deactivated account ay nangangailangan ng Admin Approval.</i>
        `;
    }

    // Intent 9: How to use / How it works / Steps ("Paano gamitin", "Mga hakbang")
    if (containsAny([
        'how to use', 'how it works', 'step', 'guide', 'instruction', 'paano gamitin', 'paano gumagana', 'mga hakbang'
    ])) {
        return `
            <strong><i class="bi bi-journal-text text-primary me-1"></i> How to Use / Paano Gamitin:</strong><br>
            1. <b>Step 1:</b> Pumili ng Document Type at mag-upload ng Valid ID.<br>
            2. <b>Step 2:</b> Mag-upload ng Selfie na hawak ang iyong ID.<br>
            3. <b>Step 3:</b> Gawin ang Biometric Face Liveness Scan.<br>
            4. <b>Step 4:</b> I-submit ang request at i-track ang status sa <b>Request History</b>!
        `;
    }

    // Out-Of-Domain (OOD) Guardrail Fallback: Taglish Polite Scope Notice
    return `
        <strong><i class="bi bi-exclamation-triangle-fill text-warning me-1"></i> Barangay AI Scope Notice:</strong><br>
        Magandang araw, resident! 👋 Ako ang <b>Barangay Document Request AI Assistant</b>, na nakadisenyo para tumulong sa mga serbisyo ng Barangay Bulsa-Korapot portal.<br><br>
        Hindi ko masagot ang mga pangkalahatang tanong sa labas ng aming system tulad ng <i>"${query}"</i>.<br><br>
        💡 <b>Maaari mo akong tanungin tungkol sa:</b><br>
        • "Ano 'to?" / "Para saan itong system?"<br>
        • "Ano ang kailangan sa Clearance / Residency / Indigency?"<br>
        • "Paano ang Telegram Bot at Chat ID?"<br>
        • "Paano ang Biometric Face Scan?"<br>
        • "Paano i-print ang approved clearance?"<br>
        • "Sino ang mga gumawa ng system?"
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

// PC MOUSE DRAG-TO-SCROLL FOR DEVELOPER CAROUSEL
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

// Form Stepper & OCR Logic
const idTypeSelect = document.getElementById('idTypeSelect');
const idCardInput = document.getElementById('idCardInput');
const openIdCameraBtn = document.getElementById('openIdCameraBtn');
const idPreviewContainer = document.getElementById('idPreviewContainer');
const idPreviewImg = document.getElementById('idPreviewImg');

const ocrFeedback = document.getElementById('ocrFeedback');
const ocrSpinner = document.getElementById('ocrSpinner');
const ocrStatusText = document.getElementById('ocrStatusText');

const step2Section = document.getElementById('step2Section');
const step3Section = document.getElementById('step3Section');

const stepIndicator1 = document.getElementById('stepIndicator1');
const stepIndicator2 = document.getElementById('stepIndicator2');
const stepIndicator3 = document.getElementById('stepIndicator3');

const num1 = document.getElementById('num1');
const num2 = document.getElementById('num2');
const num3 = document.getElementById('num3');

const selfieInput = document.getElementById('selfieInput');
const openSelfieCameraBtn = document.getElementById('openSelfieCameraBtn');
const selfiePreviewContainer = document.getElementById('selfiePreviewContainer');
const selfiePreviewImg = document.getElementById('selfiePreviewImg');
const selfieFeedback = document.getElementById('selfieFeedback');

const startScanBtn = document.getElementById('startScanBtn');
const scanStatusBox = document.getElementById('scanStatusBox');
const scanStatusText = document.getElementById('scanStatusText');
const submitBtn = document.getElementById('submitBtn');
const faceVerifiedInput = document.getElementById('faceVerifiedInput');

const immersiveModal = new bootstrap.Modal(document.getElementById('immersiveScanModal'));
const video = document.getElementById('webcam');
const modalInstruction = document.getElementById('modalInstruction');
const livenessProgress = document.getElementById('livenessProgress');
const cancelScanBtn = document.getElementById('cancelScanBtn');

const cameraCaptureModal = new bootstrap.Modal(document.getElementById('cameraCaptureModal'));
const cameraModalTitle = document.getElementById('cameraModalTitle');
const captureVideo = document.getElementById('captureVideo');
const captureCanvas = document.getElementById('captureCanvas');
const snapPhotoBtn = document.getElementById('snapPhotoBtn');
const flipCameraToggle = document.getElementById('flipCameraToggle');
const useRearCameraToggle = document.getElementById('useRearCameraToggle');

let activeCameraStream = null;
let activeCaptureTarget = null;
let isScanFinished = false;

if (idTypeSelect) {
    idTypeSelect.addEventListener('change', () => {
        if (idTypeSelect.value) {
            idCardInput.disabled = false;
            openIdCameraBtn.disabled = false;
        }
    });
}

async function processFileForOCR(file, selectedType) {
    ocrFeedback.classList.remove('d-none', 'alert-danger', 'alert-success', 'alert-info');
    ocrFeedback.classList.add('alert', 'alert-info');
    ocrSpinner.classList.remove('d-none');
    ocrStatusText.innerText = `Analyzing document for ${selectedType}...`;

    try {
        const result = await Tesseract.recognize(file, 'eng');
        const text = result.data.text.toUpperCase();

        const keywordsMap = {
            "National ID": ["PHILIPPINES", "PILIPINAS", "PHILSYS", "PAMBANSANG", "IDENTITY"],
            "School ID": ["PHINMA", "EDUCATION", "ID NO.", "MAKING LIVES BETTER.", "STUDENT", "COLLEGE", "UNIVERSITY", "SCHOOL", "CAMPUS", "STUDENT NO"],
            "Driver's License": ["DRIVER", "LICENSE", "LTO", "TRANSPORTATION"],
            "UMID / SSS": ["SOCIAL SECURITY", "UMID", "SSS", "CRN"],
            "Barangay ID": ["BARANGAY", "OFFICE", "RESIDENT"]
        };

        const expectedKeywords = keywordsMap[selectedType] || [];
        const matchFound = expectedKeywords.some(keyword => text.includes(keyword));

        ocrSpinner.classList.add('d-none');

        if (matchFound) {
            ocrFeedback.className = "alert alert-success p-3 rounded-3 small mb-3";
            ocrStatusText.innerHTML = `<strong><i class="bi bi-check-circle-fill"></i> ID Verified:</strong> Document matches <b>${selectedType}</b>. Unlocking Step 2...`;

            stepIndicator1.classList.remove('active');
            stepIndicator1.classList.add('completed');
            num1.innerHTML = '<i class="bi bi-check-lg"></i>';

            setTimeout(() => {
                step2Section.classList.add('active');
                stepIndicator2.classList.add('active');
            }, 400);

        } else {
            ocrFeedback.className = "alert alert-danger p-3 rounded-3 small mb-3";
            ocrStatusText.innerHTML = `<strong><i class="bi bi-x-circle-fill"></i> Document Mismatch:</strong> The image does not match <b>${selectedType}</b>. Please attach a clear, valid ID.`;
            
            step2Section.classList.remove('active');
            step3Section.classList.remove('active');
            stepIndicator2.classList.remove('active', 'completed');
            stepIndicator3.classList.remove('active', 'completed');
            submitBtn.disabled = true;
        }
    } catch (error) {
        console.error("OCR Error:", error);
        ocrSpinner.classList.add('d-none');
        ocrFeedback.className = "alert alert-danger p-3 rounded-3 small mb-3";
        ocrStatusText.innerHTML = `<strong><i class="bi bi-exclamation-triangle-fill"></i> Error:</strong> Could not read image text clearly. Please try again.`;
    }
}

if (idCardInput) {
    idCardInput.addEventListener('change', async () => {
        const file = idCardInput.files[0];
        if (!file) return;

        idPreviewImg.src = URL.createObjectURL(file);
        idPreviewContainer.classList.remove('d-none');

        await processFileForOCR(file, idTypeSelect.value);
    });
}

if (selfieInput) {
    selfieInput.addEventListener('change', () => {
        if (selfieInput.files.length > 0) {
            const file = selfieInput.files[0];
            selfiePreviewImg.src = URL.createObjectURL(file);
            selfiePreviewContainer.classList.remove('d-none');

            selfieFeedback.classList.remove('d-none');
            stepIndicator2.classList.remove('active');
            stepIndicator2.classList.add('completed');
            num2.innerHTML = '<i class="bi bi-check-lg"></i>';

            setTimeout(() => {
                step3Section.classList.add('active');
                stepIndicator3.classList.add('active');
            }, 300);
        }
    });
}

if (openIdCameraBtn) {
    openIdCameraBtn.addEventListener('click', () => {
        activeCaptureTarget = 'id';
        cameraModalTitle.innerHTML = '<i class="bi bi-camera-fill text-primary"></i> Snap Valid ID';
        useRearCameraToggle.checked = true;
        flipCameraToggle.checked = false;
        captureVideo.classList.remove('video-flipped');
        startCaptureCamera();
    });
}

if (openSelfieCameraBtn) {
    openSelfieCameraBtn.addEventListener('click', () => {
        activeCaptureTarget = 'selfie';
        cameraModalTitle.innerHTML = '<i class="bi bi-camera-fill text-primary"></i> Snap Selfie Holding ID';
        useRearCameraToggle.checked = false;
        flipCameraToggle.checked = true;
        captureVideo.classList.add('video-flipped');
        startCaptureCamera();
    });
}

if (flipCameraToggle) {
    flipCameraToggle.addEventListener('change', () => {
        if (flipCameraToggle.checked) {
            captureVideo.classList.add('video-flipped');
        } else {
            captureVideo.classList.remove('video-flipped');
        }
    });
}

if (useRearCameraToggle) {
    useRearCameraToggle.addEventListener('change', () => {
        startCaptureCamera();
    });
}

async function startCaptureCamera() {
    try {
        if (activeCameraStream) {
            activeCameraStream.getTracks().forEach(track => track.stop());
        }

        const useRear = useRearCameraToggle.checked;
        const constraints = {
            video: {
                width: { ideal: 1280 },
                height: { ideal: 720 },
                facingMode: useRear ? { exact: "environment" } : "user"
            }
        };

        try {
            activeCameraStream = await navigator.mediaDevices.getUserMedia(constraints);
        } catch (err) {
            activeCameraStream = await navigator.mediaDevices.getUserMedia({
                video: { width: 1280, height: 720, facingMode: useRear ? "environment" : "user" }
            });
        }

        captureVideo.srcObject = activeCameraStream;
        cameraCaptureModal.show();
    } catch (err) {
        alert("Could not access the selected camera. Please check camera permissions.");
    }
}

document.getElementById('cameraCaptureModal')?.addEventListener('hidden.bs.modal', () => {
    if (activeCameraStream) {
        activeCameraStream.getTracks().forEach(track => track.stop());
        activeCameraStream = null;
    }
});

if (snapPhotoBtn) {
    snapPhotoBtn.addEventListener('click', async () => {
        if (!activeCameraStream) return;

        captureCanvas.width = captureVideo.videoWidth || 1280;
        captureCanvas.height = captureVideo.videoHeight || 720;
        const ctx = captureCanvas.getContext('2d');

        ctx.save();
        if (flipCameraToggle.checked) {
            ctx.translate(captureCanvas.width, 0);
            ctx.scale(-1, 1);
        }

        ctx.drawImage(captureVideo, 0, 0, captureCanvas.width, captureCanvas.height);
        ctx.restore();

        captureCanvas.toBlob(async (blob) => {
            const fileName = activeCaptureTarget === 'id' ? 'captured-id.jpg' : 'captured-selfie.jpg';
            const capturedFile = new File([blob], fileName, { type: 'image/jpeg' });

            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(capturedFile);

            if (activeCaptureTarget === 'id') {
                idCardInput.files = dataTransfer.files;
                idPreviewImg.src = URL.createObjectURL(blob);
                idPreviewContainer.classList.remove('d-none');
                cameraCaptureModal.hide();
                await processFileForOCR(capturedFile, idTypeSelect.value);
            } else if (activeCaptureTarget === 'selfie') {
                selfieInput.files = dataTransfer.files;
                selfiePreviewImg.src = URL.createObjectURL(blob);
                selfiePreviewContainer.classList.remove('d-none');
                cameraCaptureModal.hide();

                selfieFeedback.classList.remove('d-none');
                stepIndicator2.classList.remove('active');
                stepIndicator2.classList.add('completed');
                num2.innerHTML = '<i class="bi bi-check-lg"></i>';

                setTimeout(() => {
                    step3Section.classList.add('active');
                    stepIndicator3.classList.add('active');
                }, 300);
            }
        }, 'image/jpeg', 0.90);
    });
}

// Face Liveness Scan Logic
if (startScanBtn) {
    startScanBtn.addEventListener('click', async () => {
        immersiveModal.show();
        livenessProgress.style.width = '0%';

        modalInstruction.innerText = "📌 Step 1: Look straight ahead";
        modalInstruction.className = "badge bg-warning text-dark px-3 py-2 px-md-4 py-md-3 fs-6 fs-md-4 rounded-pill shadow-lg border border-2 border-white fw-bold text-wrap";

        try {
            activeCameraStream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 640, facingMode: "user" } });
            video.srcObject = activeCameraStream;

            let step = 0;
            let progress = 0;

            const faceMesh = new FaceMesh({
                locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
            });

            faceMesh.setOptions({
                maxNumFaces: 1,
                refineLandmarks: true,
                minDetectionConfidence: 0.9,
                minTrackingConfidence: 0.9
            });

            faceMesh.onResults((results) => {
                if (isScanFinished || step >= 3) return;

                if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) {
                    modalInstruction.innerText = "⚠️ Face not detected. Remove mask, cap, or glasses.";
                    modalInstruction.className = "badge bg-danger text-white px-3 py-2 px-md-4 py-md-3 fs-6 fs-md-4 rounded-pill shadow-lg border border-2 border-white fw-bold text-wrap";
                    return;
                }

                const landmarks = results.multiFaceLandmarks[0];
                const noseX = landmarks[1].x;
                const leftEarX = landmarks[234].x;
                const rightEarX = landmarks[454].x;

                const balance = (noseX - rightEarX) / (leftEarX - rightEarX);

                if (step === 0) {
                    modalInstruction.innerText = "📌 Step 1: Look straight ahead";
                    modalInstruction.className = "badge bg-warning text-dark px-3 py-2 px-md-4 py-md-3 fs-6 fs-md-4 rounded-pill shadow-lg border border-2 border-white fw-bold text-wrap";
                    if (balance > 0.35 && balance < 0.65) {
                        progress += 3;
                        livenessProgress.style.width = progress + '%';
                        if (progress >= 35) { step = 1; progress = 35; }
                    }
                } else if (step === 1) {
                    modalInstruction.innerText = "⬅️ Step 2: Slowly turn your head LEFT";
                    modalInstruction.className = "badge bg-info text-dark px-3 py-2 px-md-4 py-md-3 fs-6 fs-md-4 rounded-pill shadow-lg border border-2 border-white fw-bold text-wrap";
                    if (balance < 0.32) {
                        progress += 3;
                        livenessProgress.style.width = progress + '%';
                        if (progress >= 70) { step = 2; progress = 70; }
                    }
                } else if (step === 2) {
                    modalInstruction.innerText = "➡️ Step 3: Turn your head RIGHT";
                    modalInstruction.className = "badge bg-warning text-dark px-3 py-2 px-md-4 py-md-3 fs-6 fs-md-4 rounded-pill shadow-lg border border-2 border-white fw-bold text-wrap";
                    if (balance > 0.68) {
                        progress += 4;
                        livenessProgress.style.width = progress + '%';
                        if (progress >= 100) {
                            step = 3; 
                            isScanFinished = true;
                            livenessProgress.style.width = '100%';
                            modalInstruction.innerText = "✅ Biometric Liveness Passed!";
                            modalInstruction.className = "badge bg-success text-white px-3 py-2 px-md-4 py-md-3 fs-6 fs-md-4 rounded-pill shadow-lg border border-2 border-white fw-bold text-wrap";
                            
                            faceVerifiedInput.value = "true";
                            submitBtn.disabled = false;

                            stepIndicator3.classList.remove('active');
                            stepIndicator3.classList.add('completed');
                            num3.innerHTML = '<i class="bi bi-check-lg"></i>';

                            setTimeout(() => {
                                if (activeCameraStream) {
                                    activeCameraStream.getTracks().forEach(track => track.stop());
                                }
                                immersiveModal.hide();

                                startScanBtn.className = "btn btn-success w-100 fw-semibold mb-3 py-2 text-white";
                                startScanBtn.innerHTML = '<i class="bi bi-shield-check-fill me-1"></i> Biometric Scan Complete';
                                startScanBtn.disabled = true;
                                scanStatusBox.className = "p-3 bg-success bg-opacity-10 border border-success rounded-3 text-center mb-3";
                                scanStatusText.innerHTML = '<strong class="text-success"><i class="bi bi-check-circle-fill me-1"></i> Liveness Verified. You may now submit your application.</strong>';
                            }, 1200);
                        }
                    }
                }
            });

            const camera = new Camera(video, {
                onFrame: async () => {
                    if (!isScanFinished && step < 3) {
                        await faceMesh.send({ image: video });
                    }
                },
                width: 640,
                height: 640
            });
            camera.start();

        } catch (err) {
            alert("Camera permission is required to perform biometric scan.");
            immersiveModal.hide();
        }
    });
}

if (cancelScanBtn) {
    cancelScanBtn.addEventListener('click', () => {
        if (activeCameraStream) {
            activeCameraStream.getTracks().forEach(track => track.stop());
        }
        immersiveModal.hide();
    });
}

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