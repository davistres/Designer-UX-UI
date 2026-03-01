document.addEventListener('DOMContentLoaded', () => {

    const presentBtn = document.getElementById('presentBtn');
    const exitPresentBtn = document.getElementById('exitPresentBtn');
    const artboard = document.getElementById('portfolio-artboard');
    const workspace = document.getElementById('workspace');
    const toggleLeft = document.getElementById('toggleLeftSidebar');
    const toggleRight = document.getElementById('toggleRightSidebar');
    const figmaLogo = document.getElementById('mainFigmaLogo');

    // Default logo paths
    const logoWireframe = 'assets/logo/figma.png';
    const logoMockup = 'assets/logo/figma_couleur.png';

    // Helper to switch logo
    function updateLogo(state) {
        if (state === 'mockup') {
            figmaLogo.src = logoMockup;
        } else {
            figmaLogo.src = logoWireframe;
        }
    }

    // --- Zoom Logic ---
    const zoomContainer = document.getElementById('zoomContainer');
    const zoomLevelBtn = document.getElementById('zoomLevelBtn');
    const zoomLevelText = document.getElementById('zoomLevelText');
    const zoomMenu = document.getElementById('zoomMenu');
    const artboardWrapper = document.querySelector('.artboard-wrapper');
    const canvasSection = document.getElementById('canvas');
    let currentZoom = 1;

    function applyZoom(zoomValue) {
        currentZoom = zoomValue;
        if (zoomLevelText) {
            zoomLevelText.textContent = `${Math.round(currentZoom * 100)}%`;
        }
        if (artboardWrapper) {
            artboardWrapper.style.transform = `scale(${currentZoom})`;

            // Adjust margin bottom to allow scrolling when scaled up
            if (currentZoom > 1) {
                const extraHeight = artboardWrapper.offsetHeight * (currentZoom - 1);
                artboardWrapper.style.marginBottom = `${extraHeight}px`;
            } else {
                artboardWrapper.style.marginBottom = '0px';
            }
        }
    }

    if (zoomContainer && zoomMenu && zoomLevelBtn) {
        zoomLevelBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            zoomMenu.classList.toggle('hidden');
        });

        document.addEventListener('click', (e) => {
            if (!zoomContainer.contains(e.target)) {
                zoomMenu.classList.add('hidden');
            }
        });

        const zoomOptions = zoomMenu.querySelectorAll('.zoom-option');
        zoomOptions.forEach(option => {
            option.addEventListener('click', () => {
                const zoom = option.getAttribute('data-zoom');
                if (zoom === 'fit') {
                    if (canvasSection) {
                        const canvasWidth = canvasSection.clientWidth - 80;
                        const artboardWidth = 1200;
                        let fitZoom = canvasWidth / artboardWidth;
                        if (fitZoom > 1) fitZoom = 1;
                        applyZoom(fitZoom);
                    }
                } else {
                    applyZoom(parseFloat(zoom));
                }
                zoomMenu.classList.add('hidden');
            });
        });

        if (canvasSection) {
            // passive: false is required to preventDefault on wheel
            canvasSection.addEventListener('wheel', (e) => {
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    // Fine-tuned zoom factor for smooth scroll
                    const zoomFactor = 0.05;
                    let newZoom = currentZoom;
                    if (e.deltaY < 0) {
                        newZoom += zoomFactor;
                    } else {
                        newZoom -= zoomFactor;
                    }
                    newZoom = Math.max(0.1, Math.min(newZoom, 4));
                    applyZoom(newZoom);
                }
            }, { passive: false });
        }
    }

    // --- Presentation Mode Logic ---

    function enterPresentationMode() {
        document.body.classList.add('mode-present');
        exitPresentBtn.classList.remove('hidden');

        // Force mockup state
        artboard.setAttribute('data-state', 'mockup');
        updateLogo('mockup');

        // Reset zoom
        if (typeof applyZoom === 'function') {
            applyZoom(1);
        }
    }

    function exitPresentationMode() {
        document.body.classList.remove('mode-present');
        exitPresentBtn.classList.add('hidden');

        // Return to wireframe state
        artboard.setAttribute('data-state', 'wireframe');
        updateLogo('wireframe');

        // Reset scroll position of artboard wrapper
        window.scrollTo(0, 0);
    }

    presentBtn.addEventListener('click', enterPresentationMode);
    exitPresentBtn.addEventListener('click', exitPresentationMode);

    // Allow ESC key to exit presentation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && document.body.classList.contains('mode-present')) {
            exitPresentationMode();
        }
    });

    // --- Interactive Hover Logic (Desktop) ---
    // In wireframe mode, hovering over the artboard temporarily reveals it
    artboard.addEventListener('mouseenter', () => {
        if (!document.body.classList.contains('mode-present')) {
            artboard.setAttribute('data-state', 'mockup');
            updateLogo('mockup');
        }
    });

    artboard.addEventListener('mouseleave', () => {
        if (!document.body.classList.contains('mode-present')) {
            artboard.setAttribute('data-state', 'wireframe');
            updateLogo('wireframe');
        }
    });

    // --- Mobile Touch Logic for reveal ---
    artboard.addEventListener('click', (e) => {
        if (!document.body.classList.contains('mode-present')) {
            const currentState = artboard.getAttribute('data-state');
            const newState = currentState === 'wireframe' ? 'mockup' : 'wireframe';
            artboard.setAttribute('data-state', newState);
            updateLogo(newState);
        }
    });

    // --- Sidebar Toggle Logic ---
    toggleLeft.addEventListener('click', () => {
        workspace.classList.toggle('left-open');
    });

    toggleRight.addEventListener('click', () => {
        workspace.classList.toggle('right-open');
    });

    // --- Tooltip & Interactive Animations ---
    const tooltips = document.querySelectorAll('.tooltip-container');
    const highFiveBtn = document.getElementById('highFiveBtn');
    const highFiveOverlay = document.getElementById('highFiveAnimation');
    const logoContainer = document.getElementById('logoContainer');

    // Handle mobile tooltips (tap to show, tap elsewhere to hide)
    document.addEventListener('click', (e) => {
        // If clicking on logoContainer directly, toggle it
        if (logoContainer && logoContainer.contains(e.target)) {
            logoContainer.classList.toggle('tooltip-mobile-visible');
        } else {
            // Hide all tooltips if clicking outside
            tooltips.forEach(t => {
                if (t !== highFiveBtn && t !== logoContainer) {
                    t.classList.remove('tooltip-mobile-visible');
                }
            });
            if (logoContainer && !logoContainer.contains(e.target)) {
                logoContainer.classList.remove('tooltip-mobile-visible');
            }
        }
    });

    // High Five Animation Logic
    if (highFiveBtn && highFiveOverlay) {
        let lastClickTime = 0;

        highFiveBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent document click from interfering

            const currentTime = new Date().getTime();
            const timeDiff = currentTime - lastClickTime;
            lastClickTime = currentTime;

            // Always manage tooltips on click for mobile
            if (!logoContainer.contains(e.target)) {
                highFiveBtn.classList.add('tooltip-mobile-visible');
                logoContainer.classList.remove('tooltip-mobile-visible');
            }

            // Only trigger on fast double click (<400ms)
            if (timeDiff > 0 && timeDiff <= 400) {
                // Trigger Animation
                highFiveOverlay.classList.remove('hidden');

                // Force reflow for CSS transition to work
                void highFiveOverlay.offsetWidth;

                // Start sliding in
                highFiveOverlay.classList.add('animating');

                // Wait for slide-in (300ms now), then slap and confetti
                setTimeout(() => {
                    highFiveOverlay.classList.add('slap');

                    // Fire Confetti
                    if (window.confetti) {
                        confetti({
                            particleCount: 200, // a bit more confetti for impact
                            spread: 120,
                            origin: { y: 0.5 },
                            zIndex: 10000,
                            colors: ['#4F46E5', '#EC4899', '#10B981', '#F59E0B']
                        });
                    }

                    // End animation gracefully after slap and confetti burst
                    setTimeout(() => {
                        highFiveOverlay.classList.remove('animating', 'slap');
                        highFiveOverlay.classList.add('hidden');
                        highFiveBtn.classList.remove('tooltip-mobile-visible');
                    }, 1500);

                }, 300);
            }
        });

        // Ensure clicking outside hides the highFiveBtn tooltip on mobile
        document.addEventListener('click', (e) => {
            if (!highFiveBtn.contains(e.target)) {
                highFiveBtn.classList.remove('tooltip-mobile-visible');
            }
        });
    }

});
