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

    // Intent 0: Greetings & Self-Identity ("Hi", "Hello", "What are you", "Ano ka", "Kamusta", "Sino ka")
    const isGreetingOrIdentity = q === 'hi' || q === 'hello' || q === 'hey' || 
        q.startsWith('hi ') || q.startsWith('hello ') || q.startsWith('hey ') ||
        containsAny([
            'what are you', 'who are you', 'ano ka', 'sino ka', 'kamusta', 'kumusta', 
            'magandang araw', 'magandang umaga', 'magandang hapon', 'magandang gabi', 
            'good morning', 'good afternoon', 'good evening', 'anong ai ka', 'what kind of ai'
        ]);

    if (isGreetingOrIdentity) {
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

    // Intent 1: System Identification / "What is this" / "Ano 'to"
    if (containsAny([
        'what is this', 'ano to', "ano 'to", 'ano ito', 'para saan to', "para saan 'to", 'para saan ito',
        'what is this system', 'ano tong system', 'ano itong system', 'what is this portal', 'what is this website',
        'what can you do', 'anong magagawa mo', 'anong ginagawa nito', 'tungkol saan to', "tungkol saan 'to",
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