// =========================================================
// DIRECT EMBEDDED DASHBOARD AI ASSISTANT ENGINE (DYNAMIC TRILINGUAL)
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
            <span class="text-muted">AI is analyzing query...</span>
        </div>
    `;

    setTimeout(() => {
        const answer = generateBarangayAiResponse(query);
        aiAnswerText.innerHTML = answer;
    }, 600);
}

// Language Detector (Tagalog, English, Taglish)
function detectLanguage(query) {
    const q = query.toLowerCase().trim();
    
    const tagalogTokens = ['ano', 'paano', 'kailan', 'sino', 'magkano', 'bakit', 'saan', 'ba', 'ko', 'mo', 'nito', 'ito', 'to', 'mga', 'kailangan', 'gumawa', 'kumuha', 'naman', 'pala', 'kasi', 'po', 'opo', 'libre', 'bayad', 'may', 'wala', 'ako', 'ikaw', 'kami', 'tayo', 'sa', 'na', 'nang'];
    const englishTokens = ['what', 'how', 'when', 'who', 'why', 'where', 'can', 'should', 'would', 'is', 'are', 'the', 'this', 'that', 'which', 'does', 'do', 'requirement', 'requirements', 'need', 'apply', 'fee', 'cost', 'free', 'developer', 'developers', 'system', 'portal', 'status', 'print', 'clearance', 'residency', 'indigency'];

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

    return 'taglish'; // default
}

function generateBarangayAiResponse(query) {
    const q = query.toLowerCase().trim();
    const lang = detectLanguage(query);
    const containsAny = (keywords) => keywords.some(k => q.includes(k));

    // Intent 0: Greetings & Identity
    const isGreetingOrIdentity = q === 'hi' || q === 'hello' || q === 'hey' || 
        q.startsWith('hi ') || q.startsWith('hello ') || q.startsWith('hey ') ||
        containsAny([
            'what are you', 'who are you', 'ano ka', 'sino ka', 'kamusta', 'kumusta', 
            'magandang araw', 'magandang umaga', 'magandang hapon', 'magandang gabi', 
            'good morning', 'good afternoon', 'good evening', 'anong ai ka', 'what kind of ai'
        ]);

    if (isGreetingOrIdentity) {
        if (lang === 'tagalog') {
            return `
                <strong><i class="bi bi-robot text-primary me-1"></i> Barangay AI Assistant 👋</strong><br>
                Magandang araw! Ako ang inyong <b>Barangay AI Assistant</b> para sa Barangay Bulsa-Korapot Document Request Portal.<br><br>
                💡 <b>Maaari mo akong tanungin tungkol sa:</b><br>
                • <b>Mga Kailangan sa Dokumento:</b> Clearance, Residency, o Indigency<br>
                • <b>Telegram Bot:</b> Pagtatakda ng notifications at Chat ID<br>
                • <b>Biometric Verification:</b> Paano gumagana ang Face Scan<br>
                • <b>Status at Pag-print:</b> Pagsubaybay at pag-print ng approved documents<br><br>
                👉 <i>Ano ang maipaglilingkod ko sa iyo ngayon?</i>
            `;
        } else if (lang === 'english') {
            return `
                <strong><i class="bi bi-robot text-primary me-1"></i> Barangay AI Assistant 👋</strong><br>
                Good day, resident! I am your <b>Barangay AI Assistant</b> for the Barangay Bulsa-Korapot Document Request Portal.<br><br>
                💡 <b>You can ask me about:</b><br>
                • <b>Document Requirements:</b> Clearance, Residency, or Indigency<br>
                • <b>Telegram Bot:</b> Setting up notifications and Chat ID<br>
                • <b>Biometric Verification:</b> How the 3D Face Scan works<br>
                • <b>Request Status & Printing:</b> Tracking and printing approved clearances<br><br>
                👉 <i>How may I assist you today? Try asking: <b>"What are the requirements for Clearance?"</b></i>
            `;
        } else {
            return `
                <strong><i class="bi bi-robot text-primary me-1"></i> Barangay AI Assistant 👋</strong><br>
                Magandang araw, resident! Ako ang inyong <b>Barangay AI Assistant</b> para sa Barangay Bulsa-Korapot Document Request Portal.<br><br>
                💡 <b>Maaari mo akong tanungin tungkol sa:</b><br>
                • <b>Document Requirements:</b> Clearance, Residency, o Indigency<br>
                • <b>Telegram Bot:</b> Setup ng notifications at Chat ID<br>
                • <b>Biometric Verification:</b> Paano gumagana ang Face Scan<br>
                • <b>Request Status & Printing:</b> Tracking at pag-print ng approved documents<br><br>
                👉 <i>Ano ang maipaglilingkod ko sa iyo ngayon? Subukang magtanong: <b>"Ano ang kailangan sa Clearance?"</b></i>
            `;
        }
    }

    // Intent 1: System Purpose
    if (containsAny([
        'what is this', 'ano to', "ano 'to", 'ano ito', 'para saan to', "para saan 'to", 'para saan ito',
        'what is this system', 'ano tong system', 'ano itong system', 'what is this portal', 'what is this website',
        'what can you do', 'anong magagawa mo', 'anong ginagawa nito', 'tungkol saan to', "tungkol saan 'to",
        'about this system', 'purpose of this'
    ])) {
        if (lang === 'tagalog') {
            return `
                <strong><i class="bi bi-info-circle-fill text-primary me-1"></i> Barangay Bulsa-Korapot Request System & AI Assistant:</strong><br>
                • <b>Para Saan Itong System?</b> Ito ay isang automated online portal para sa mga residente ng Barangay Bulsa-Korapot upang kumuha ng mga dokumento (Clearance, Residency, Indigency) nang hindi na kailangang pumila sa barangay hall.<br>
                • <b>Anong Ginagawa ng AI Assistant?</b> Tumutulong ako sa pag-check ng mga kailangan sa dokumento, pag-setup ng Telegram bot alerts, pagpapaliwanag ng biometric face scan, at pag-navigate sa portal.<br>
                • <b>Academic Prototype Note:</b> Binuo bilang isang capstone project prototype para sa BSIT program.
            `;
        } else if (lang === 'english') {
            return `
                <strong><i class="bi bi-info-circle-fill text-primary me-1"></i> Barangay Bulsa-Korapot Request System & AI Assistant:</strong><br>
                • <b>System Purpose:</b> An automated digital platform designed for residents of Barangay Bulsa-Korapot to request clearances and certificates remotely without physical queuing.<br>
                • <b>AI Assistant Role:</b> I assist residents with document requirements, Telegram bot alerts setup, biometric face liveness scanning instructions, and portal navigation.<br>
                • <b>Academic Prototype Note:</b> Developed as a BSIT capstone project prototype for digital government automation.
            `;
        } else {
            return `
                <strong><i class="bi bi-info-circle-fill text-primary me-1"></i> Barangay Bulsa-Korapot Request System & AI Assistant:</strong><br>
                • <b>Ano / Para Saan itong System?</b> Ito ay isang automated online portal para sa mga residente ng Barangay Bulsa-Korapot upang kumuha ng mga dokumento (Clearance, Residency, Indigency) nang hindi na kailangang pumila sa barangay hall.<br>
                • <b>Sino / Anong ginagawa ng AI Chatbot?</b> Ako ang inyong <b>Barangay AI Assistant</b>! Tumutulong ako sa pag-check ng mga kailangan sa dokumento, pag-setup ng Telegram bot alerts, pagpapaliwanag ng biometric face scan, at pag-navigate sa portal.<br>
                • <b>Academic Prototype Note:</b> Developed as a BSIT program project prototype for digital government service automation.
            `;
        }
    }

    // Intent 2: Developer / BSIT Team Info
    if (containsAny([
        'developer', 'creator', 'who made', 'who built', 'sino gumawa', 'sinong gumawa', 'sino nag-code', 'sino nag code',
        'sino nag-build', 'sinong dev', 'mga gumawa', 'jeffrey', 'bsit team', 'team', 'author'
    ])) {
        if (lang === 'tagalog') {
            return `
                <strong><i class="bi bi-code-slash text-primary me-1"></i> Mga Gumawa ng System (BSIT Project Team):</strong><br>
                • <b>Lead Developer:</b> Jeffrey M. Serrano Jr.<br>
                • <b>Assistant Developer:</b> Jalayahay, Jessa Mae P.<br>
                • <b>Presentor:</b> Mines, Manzor M.<br>
                • <b>Documentation Team:</b> Gutierrez, Rovil B., Prescillas, Ej Y., Kurt Bactat Russel, Tyrone James Oribiada.
            `;
        } else if (lang === 'english') {
            return `
                <strong><i class="bi bi-code-slash text-primary me-1"></i> System Developers (BSIT Project Team):</strong><br>
                • <b>Lead Developer:</b> Jeffrey M. Serrano Jr.<br>
                • <b>Assistant Developer:</b> Jalayahay, Jessa Mae P.<br>
                • <b>Project Presentor:</b> Mines, Manzor M.<br>
                • <b>Documentation Team:</b> Gutierrez, Rovil B., Prescillas, Ej Y., Kurt Bactat Russel, Tyrone James Oribiada.<br>
                • Built as an academic capstone prototype for local barangay document automation.
            `;
        } else {
            return `
                <strong><i class="bi bi-code-slash text-primary me-1"></i> BSIT Project Information (Mga Gumawa):</strong><br>
                • <b>Lead Developer:</b> Jeffrey M. Serrano Jr.<br>
                • <b>Assistant Developer:</b> Jalayahay, Jessa Mae P.<br>
                • <b>Presentor:</b> Mines, Manzor M.<br>
                • <b>Documentation Team:</b> Gutierrez, Rovil B., Prescillas, Ej Y., Kurt Bactat Russel, Tyrone James Oribiada.<br>
                • Built as an academic prototype for local barangay document automation and biometric verification.
            `;
        }
    }

    // Intent 3: Document Requirements
    if (containsAny([
        'requirement', 'clearance', 'residency', 'indigency', 'apply', 'certificate', 'kailangan', 'mga kailangan',
        'anong kailangan', 'paano kumuha', 'paano mag-apply', 'paano mag apply', 'paano kumuha ng clearance'
    ])) {
        if (lang === 'tagalog') {
            return `
                <strong><i class="bi bi-file-earmark-check-fill text-success me-1"></i> Mga Kailangan sa Dokumento:</strong><br>
                • <b>Barangay Clearance:</b> Valid ID (National ID, School ID, Driver's License, UMID, Barangay ID) at Litrato (Selfie) na hawak ang ID.<br>
                • <b>Certificate of Residency:</b> Katibayan ng tirahan o valid ID na nakasaad ang Barangay Bulsa-Korapot.<br>
                • <b>Certificate of Indigency:</b> Valid ID para sa tulong pampinansyal o iskolarsip.<br><br>
                👉 <i>I-click ang <b>"Apply Document"</b> sa itaas upang mag-submit!</i>
            `;
        } else if (lang === 'english') {
            return `
                <strong><i class="bi bi-file-earmark-check-fill text-success me-1"></i> Document Requirements & Application:</strong><br>
                • <b>Barangay Clearance:</b> Requires a valid ID (National ID, Student ID, Driver's License, UMID, Barangay ID) and a Selfie holding your ID.<br>
                • <b>Certificate of Residency:</b> Requires proof of residence or valid ID stating Barangay Bulsa-Korapot.<br>
                • <b>Certificate of Indigency:</b> Valid ID required for financial assistance or scholarship support.<br><br>
                👉 <i>Click **"Apply Document"** at the top of your screen to launch your application!</i>
            `;
        } else {
            return `
                <strong><i class="bi bi-file-earmark-check-fill text-success me-1"></i> Document Requirements / Mga Kailangan:</strong><br>
                • <b>Barangay Clearance:</b> Requires valid ID (National ID, Student ID, Driver's License, UMID, o Barangay ID) at Selfie na hawak ang ID.<br>
                • <b>Certificate of Residency:</b> Requires proof of address o valid ID na nakasaad ang Barangay Bulsa-Korapot.<br>
                • <b>Certificate of Indigency:</b> Para sa tulong pampinansyal o iskolarsip; valid ID kinakailangan.<br><br>
                👉 <i>Maaari kang mag-apply sa pamamagitan ng pag-click ng <b>"Apply Document"</b> sa itaas!</i>
            `;
        }
    }

    // Intent 4: Telegram Setup & OTP
    if (containsAny([
        'telegram', 'bot', 'chat id', 'notification', 'otp', 'alert', 'mga alert', 'paano mag telegram'
    ])) {
        if (lang === 'tagalog') {
            return `
                <strong><i class="bi bi-telegram text-primary me-1"></i> Pagtatakda ng Telegram Bot:</strong><br>
                1. Mag-open ng Telegram at hanapin ang <a href="https://t.me/userinfobot" target="_blank" class="fw-bold text-accent-link">@userinfobot</a> para makuha ang iyong Chat ID.<br>
                2. Buksan ang <a href="https://t.me/BrgyDocRequestBot" target="_blank" class="fw-bold text-accent-link">@BrgyDocRequestBot</a> at i-tap ang <b>START</b>.<br>
                3. Ilagay ang iyong Chat ID sa <b>Settings</b> page para makatanggap ng real-time notification messages at OTP codes!
            `;
        } else if (lang === 'english') {
            return `
                <strong><i class="bi bi-telegram text-primary me-1"></i> Telegram Notification Bot Setup:</strong><br>
                1. Open Telegram and search for <a href="https://t.me/userinfobot" target="_blank" class="fw-bold text-accent-link">@userinfobot</a> to retrieve your numerical Chat ID.<br>
                2. Open <a href="https://t.me/BrgyDocRequestBot" target="_blank" class="fw-bold text-accent-link">@BrgyDocRequestBot</a> and tap **START**.<br>
                3. Enter your Chat ID in **Settings** to receive instant approval alerts and 6-digit OTP codes!
            `;
        } else {
            return `
                <strong><i class="bi bi-telegram text-primary me-1"></i> Telegram Notification Bot Setup:</strong><br>
                1. Mag-open ng Telegram at hanapin ang <a href="https://t.me/userinfobot" target="_blank" class="fw-bold text-accent-link">@userinfobot</a> para makuha ang iyong Chat ID.<br>
                2. Buksan ang <a href="https://t.me/BrgyDocRequestBot" target="_blank" class="fw-bold text-accent-link">@BrgyDocRequestBot</a> at i-tap ang <b>START</b>.<br>
                3. Ilagay ang iyong Chat ID sa <b>Settings</b> page para makatanggap ng instant approval o rejection notification messages!
            `;
        }
    }

    // Intent 5: Biometric Face Scan
    if (containsAny([
        'face', 'liveness', 'scan', 'biometric', 'camera', 'kamera', 'verification', 'mukha', 'litrato'
    ])) {
        if (lang === 'tagalog') {
            return `
                <strong><i class="bi bi-shield-lock-fill text-info me-1"></i> Biometric Face Scan Verification:</strong><br>
                • Ang portal ay gumagamit ng <b>MediaPipe FaceMesh tracking</b> para sa seguridad.<br>
                • <b>Hakbang 1:</b> Tumingin nang diretso sa green guide.<br>
                • <b>Hakbang 2:</b> Iling nang dahan-dahan ang ulo sa KALIWA (LEFT).<br>
                • <b>Hakbang 3:</b> Iling ang ulo sa KANAN (RIGHT) para ma-pass ang verification.
            `;
        } else if (lang === 'english') {
            return `
                <strong><i class="bi bi-shield-lock-fill text-info me-1"></i> Biometric Face Liveness Scan:</strong><br>
                • Uses **MediaPipe 3D FaceMesh landmark tracking** for anti-spoofing security.<br>
                • **Step 1:** Look straight ahead into the camera guide.<br>
                • **Step 2:** Turn your head slowly to the LEFT.<br>
                • **Step 3:** Turn your head to the RIGHT to pass verification.
            `;
        } else {
            return `
                <strong><i class="bi bi-shield-lock-fill text-info me-1"></i> Biometric Liveness Verification (Face Scan):</strong><br>
                • Ang portal ay gumagamit ng <b>MediaPipe FaceMesh landmark tracking</b> para sa seguridad ng residente.<br>
                • <b>Step 1:</b> Tumingin nang diretso sa bilog na green guide.<br>
                • <b>Step 2:</b> Iling nang dahan-dahan ang ulo sa KALIWA (LEFT).<br>
                • <b>Step 3:</b> Iling ang ulo sa KANAN (RIGHT) para ma-pass ang verification.
            `;
        }
    }

    // Intent 6: Status & Printing
    if (containsAny([
        'status', 'history', 'track', 'print', 'approve', 'reject', 'kailan makukuha', 'kailan ma-approve', 'mga request'
    ])) {
        if (lang === 'tagalog') {
            return `
                <strong><i class="bi bi-clock-history text-warning me-1"></i> Pagsubaybay at Pag-print ng Dokumento:</strong><br>
                • I-click ang <b>"Request History"</b> card sa itaas para makita ang live status.<br>
                • Kapag APPROVED na ang request, lalabas ang berdeng <b>"Print Clearance"</b> button.<br>
                • Makakatanggap ka rin ng mensahe sa Telegram kapag na-review na ng Admin ang iyong request.
            `;
        } else if (lang === 'english') {
            return `
                <strong><i class="bi bi-clock-history text-warning me-1"></i> Request Tracking & Printing:</strong><br>
                • Click **"Request History"** at the top to view real-time status updates.<br>
                • Once status shows **APPROVED**, a green **"Print Clearance"** button appears to view/print your document.<br>
                • You will also receive an automated Telegram alert when the Admin reviews your application.
            `;
        } else {
            return `
                <strong><i class="bi bi-clock-history text-warning me-1"></i> Request Tracking & Printing (Pag-check at Print):</strong><br>
                • I-click ang <b>"Request History"</b> card o tab sa itaas para makita ang live updates.<br>
                • Kapag APPROVED na ang request, lalabas ang kulay berdeng <b>"Print"</b> button para mai-print ang opisyal na dokumento.<br>
                • Makakatanggap ka rin ng alert sa Telegram kapag na-review na ng Admin ang iyong request.
            `;
        }
    }

    // Intent 7: Fees & Payment
    if (containsAny([
        'fee', 'price', 'cost', 'pay', 'payment', 'free', 'magkano', 'may bayad', 'libre ba', 'magkano magbayad'
    ])) {
        if (lang === 'tagalog') {
            return `
                <strong><i class="bi bi-cash-stack text-success me-1"></i> Bayad sa Dokumento:</strong><br>
                • Ang paghiling ng dokumento gamit ang portal na ito ay 100% <b>LIBRE (FREE)</b>.<br>
                • Walang anumang bayad o hidden charges sa pag-apply online.
            `;
        } else if (lang === 'english') {
            return `
                <strong><i class="bi bi-cash-stack text-success me-1"></i> Document Fees & Payments:</strong><br>
                • Requesting documents through the **Barangay Request Portal** is 100% **FREE ($0)**.<br>
                • There are no hidden fees or charges for submitting applications online.
            `;
        } else {
            return `
                <strong><i class="bi bi-cash-stack text-success me-1"></i> Document Fees & Payments (Bayad):</strong><br>
                • Ang paghiling ng dokumento gamit ang <b>Barangay Request Portal</b> ay 100% <b>LIBRE (FREE)</b> para sa pampublikong pagsubok.<br>
                • Walang anumang hidden charges sa pag-apply online.
            `;
        }
    }

    // Intent 8: Account & Deactivation
    if (containsAny([
        'account', 'setting', 'password', 'deactivate', 'reactivate', 'profile', 'palitan', 'nakalimutan'
    ])) {
        if (lang === 'tagalog') {
            return `
                <strong><i class="bi bi-gear-fill text-primary me-1"></i> Pamamahala ng Account:</strong><br>
                • Pumunta sa <b>"Settings"</b> sa navigation bar para i-update ang pangalan, Username, Password, o Telegram Chat ID (nangangailangan ng Telegram OTP).<br>
                • <i>Paalala: Ang pag-reactivate ng deactivated account ay nangangailangan ng manual Admin Approval.</i>
            `;
        } else if (lang === 'english') {
            return `
                <strong><i class="bi bi-gear-fill text-primary me-1"></i> Account Settings & Security:</strong><br>
                • Visit **"Settings"** in the top navigation bar to update your Name, Username, Password, or Telegram Chat ID (requires Telegram OTP verification).<br>
                • *Note: Reactivating a deactivated account requires manual Barangay Admin approval.*
            `;
        } else {
            return `
                <strong><i class="bi bi-gear-fill text-primary me-1"></i> Account & Settings Management:</strong><br>
                • I-click ang <b>"Settings"</b> sa navigation bar para i-update ang pangalan, Username, o Telegram Chat ID.<br>
                • Maaari mo ring palitan ang iyong Password o i-deactivate muna ang iyong account.<br>
                • <i>Tandaan: Ang pag-reactivate ng deactivated account ay nangangailangan ng Admin Approval.</i>
            `;
        }
    }

    // Fallback Out-Of-Domain Notice
    if (lang === 'tagalog') {
        return `
            <strong><i class="bi bi-exclamation-triangle-fill text-warning me-1"></i> Barangay AI Scope Notice:</strong><br>
            Magandang araw! Ako ang <b>Barangay Document Request AI Assistant</b>, na nakadisenyo lamang para tumulong sa mga serbisyo ng Barangay Bulsa-Korapot portal.<br><br>
            Hindi ko masagot ang mga tanong sa labas ng aming system tulad ng <i>"${query}"</i>.<br><br>
            💡 <b>Maaari mo akong tanungin tungkol sa:</b><br>
            • "Ano ang kailangan sa Clearance / Residency / Indigency?"<br>
            • "Paano ang Telegram Bot at Chat ID?"<br>
            • "Paano ang Biometric Face Scan?"<br>
            • "Paano i-print ang approved clearance?"
        `;
    } else if (lang === 'english') {
        return `
            <strong><i class="bi bi-exclamation-triangle-fill text-warning me-1"></i> Barangay AI Scope Notice:</strong><br>
            Good day, resident! I am the **Barangay Document Request AI Assistant**, designed specifically to assist with Barangay Bulsa-Korapot portal services.<br><br>
            I cannot answer questions outside of our portal system such as *"_${query}_"*.<br><br>
            💡 **You may ask me about:**<br>
            • "What are the requirements for Clearance / Residency / Indigency?"<br>
            • "How do I set up Telegram Bot alerts and Chat ID?"<br>
            • "How does the Biometric Face Scan work?"<br>
            • "How do I print my approved document?"
        `;
    } else {
        return `
            <strong><i class="bi bi-exclamation-triangle-fill text-warning me-1"></i> Barangay AI Scope Notice:</strong><br>
            Magandang araw, resident! 👋 Ako ang <b>Barangay Document Request AI Assistant</b>, na nakadisenyo para tumulong sa mga serbisyo ng Barangay Bulsa-Korapot portal.<br><br>
            Hindi ko masagot ang mga pangkalahatang tanong sa labas ng aming system tulad ng <i>"${query}"</i>.<br><br>
            💡 <b>Maaari mo akong tanungin tungkol sa:</b><br>
            • "Ano 'to?" / "Para saan itong system?"<br>
            • "Ano ang kailangan sa Clearance / Residency / Indigency?"<br>
            • "Paano ang Telegram Bot at Chat ID?"<br>
            • "Paano ang Biometric Face Scan?"<br>
            • "Paano i-print ang approved clearance?"
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