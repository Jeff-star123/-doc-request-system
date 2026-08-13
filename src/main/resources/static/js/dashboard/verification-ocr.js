// =========================================================
// DOCUMENT STEPPER, TESSERACT OCR & MEDIAPIPE FACE SCAN
// =========================================================

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

// FIXED: Re-verify existing file if ID Category Dropdown changes!
if (idTypeSelect) {
    idTypeSelect.addEventListener('change', async () => {
        if (idTypeSelect.value) {
            idCardInput.disabled = false;
            openIdCameraBtn.disabled = false;

            // Re-trigger OCR verification if an image is already attached!
            if (idCardInput.files && idCardInput.files.length > 0) {
                await processFileForOCR(idCardInput.files[0], idTypeSelect.value);
            }
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
            ocrStatusText.innerHTML = `<strong><i class="bi bi-x-circle-fill"></i> Document Mismatch:</strong> The uploaded image does not match <b>${selectedType}</b>. Please attach a clear, valid ID for ${selectedType}.`;
            
            // LOCK NEXT STEPS ON CATEGORY MISMATCH
            step2Section.classList.remove('active');
            step3Section.classList.remove('active');
            stepIndicator1.classList.add('active');
            stepIndicator1.classList.remove('completed');
            num1.innerHTML = '1';
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