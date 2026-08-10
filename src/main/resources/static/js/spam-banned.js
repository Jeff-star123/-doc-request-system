function runMultimediaBanSequence() {
    const voiceOver = document.getElementById('voiceOverAudio');
    const budotsMusic = document.getElementById('budotsAudio');
    const jumpscareVideo = document.getElementById('jumpscareVideo');
    const jumpScareOverlay = document.getElementById('jumpScareOverlay');
    const initialContainer = document.getElementById('initialWarningContainer');

    if (!voiceOver || !budotsMusic || !jumpscareVideo || !jumpScareOverlay || !initialContainer) return;

    // Reset media state
    jumpScareOverlay.classList.remove('active');
    initialContainer.style.opacity = '1';
    budotsMusic.pause();
    budotsMusic.currentTime = 0;
    voiceOver.pause();
    voiceOver.currentTime = 0;

    // Play voice-over notification first
    voiceOver.play().catch(error => {
        console.log("Autoplay blocked by browser policy. User interaction required.");
    });

    // Trigger full overlay & Budots video upon voice-over completion
    voiceOver.onended = () => {
        initialContainer.style.opacity = '0';
        setTimeout(() => {
            jumpscareVideo.play().catch(e => console.log("Video playback error:", e));
            budotsMusic.play().catch(e => console.log("Background music autoplay error:", e));
            jumpScareOverlay.classList.add('active');
        }, 150);
    };
}

window.addEventListener('DOMContentLoaded', () => {
    runMultimediaBanSequence();
});