document.addEventListener('DOMContentLoaded', () => {

    const presentBtn = document.getElementById('presentBtn');
    const exitPresentBtn = document.getElementById('exitPresentBtn');
    const artboard = document.getElementById('portfolio-artboard');
    const workspace = document.getElementById('workspace');
    const toggleLeft = document.getElementById('toggleLeftSidebar');
    const toggleRight = document.getElementById('toggleRightSidebar');
    const figmaLogo = document.getElementById('mainFigmaLogo');

    const cursorBtn = document.getElementById('cursorBtn');
    const tagBtn = document.getElementById('tagBtn');

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

    // --- Tag Tool & Hashtag Logic ---
    let tagModeActive = false;

    if (cursorBtn && tagBtn) {
        cursorBtn.addEventListener('click', () => {
            tagModeActive = false;
            cursorBtn.classList.add('tool-active');
            tagBtn.classList.remove('tool-active');
            workspace.style.cursor = 'default';
            if (artboard) artboard.style.cursor = 'default';
        });

        tagBtn.addEventListener('click', () => {
            tagModeActive = true;
            tagBtn.classList.add('tool-active');
            cursorBtn.classList.remove('tool-active');
            workspace.style.cursor = 'crosshair';
            if (artboard) artboard.style.cursor = 'crosshair';
        });
    }

    const uxHashtags = [
        "#Empathique", "#Curieux", "#Observateur", "#OuvertÀLaCritique", "#Rigoureux",
        "#Minutieux", "#Collaboratif", "#Accessibilité", "#DesignSystems", "#Responsive",
        "#Typographie", "#Figma", "#Illustrator", "#Photoshop", "#Hotjar", "#Maze",
        "#Wireframe", "#Prototypage", "#UserTesting", "#Personas", "#UserJourney",
        "#UI", "#UX", "#Interface", "#Ergonomie", "#A/BTesting", "#MobileFirst",
        "#PixelPerfect", "#DesignThinking", "#ArchitectureDeLInformation",
        "#MicroInteractions", "#UserFlow"
    ];

    const humorHashtags = [
        "#CaféEnIntraveineuse", "#EncoreUneModifVendredi17h?", "#ZenMêmeSiToutCrashe",
        "#LeClientDitOuiMais...", "#LeBudgetQuiPleure", "#FuyonsL'AgilitéToxique",
        "#PixelliséEtFier", "#OopsJ'aiSuppriméLeCalque", "#AutoLayoutGalère",
        "#ComicSansInterdit", "#LisezMonLoremIpsum", "#FigmaM'aTué", "#MakeItPop!",
        "#PlusGrosLeLogo", "#CtrlZ"
    ];

    const allHashtags = [...uxHashtags, ...humorHashtags];

    function spawnHashtags(e) {
        // Prevent default only if it's hitting the wrapper or canvas directly to avoid breaking regular button clicks if they bubbling up
        const target = e.target;

        // Ensure we only spawn if clicking within the workspace/canvas area
        if (!workspace.contains(target) || target.closest('.sidebar') || target.closest('.topbar')) {
            return;
        }

        // Generate 8 unique tags
        let shuffledTags = [...allHashtags].sort(() => 0.5 - Math.random());
        let selectedTags = shuffledTags.slice(0, 8);

        // Calculate origin based on page coordinates
        const originX = e.pageX;
        const originY = e.pageY;

        // Distribute tags evenly in a circle to prevent overlapping
        const angleStep = (Math.PI * 2) / selectedTags.length;

        selectedTags.forEach((tagText, index) => {
            // Random delay between 0,001s (1ms) and 5s (5000ms)
            const delay = Math.floor(Math.random() * (5000 - 1 + 1)) + 1;

            // Give each tag a roughly equal piece of the pie (with minor random offset)
            const baseAngle = index * angleStep;
            const randomAngleOffset = (Math.random() - 0.5) * (angleStep * 0.8);
            const finalAngle = baseAngle + randomAngleOffset;

            setTimeout(() => {
                createHashtagBubble(tagText, originX, originY, finalAngle);
            }, delay);
        });
    }

    function createHashtagBubble(text, originX, originY, angle) {
        const bubble = document.createElement('div');
        bubble.className = 'hashtag-bubble';
        bubble.textContent = text;
        document.body.appendChild(bubble);

        // Duration logic: min 1s, max 3s based on length (assume 30 chars is max for 6s)
        const minTime = 1000;
        const maxTime = 3000;
        const lengthRatio = Math.min(text.length / 30, 1);
        const duration = minTime + (maxTime - minTime) * lengthRatio;

        // Position: Push longer texts further out to avoid crowding the center
        // Base radius 60px, up to 150px, plus extra depending on word length
        const baseRadius = 60 + Math.random() * 90;
        const lengthRadiusBoost = text.length * 2.5;
        const radius = baseRadius + lengthRadiusBoost;

        const x = originX + Math.cos(angle) * radius;
        const y = originY + Math.sin(angle) * radius;

        // Center on the specific coordinates
        bubble.style.left = `${x}px`;
        bubble.style.top = `${y}px`;
        // Negative margins to properly center the bubble exactly on X/Y
        bubble.style.transform = `translate(-50%, -50%) scale(0)`;

        // Force reflow
        void bubble.offsetWidth;

        // Show animation
        requestAnimationFrame(() => {
            bubble.classList.add('show');
            bubble.style.transform = `translate(-50%, -50%) scale(1)`; // Needs explicit transform due to centering
        });

        // Pop and remove after duration
        setTimeout(() => {
            bubble.classList.remove('show');
            bubble.classList.add('pop');
            bubble.style.transform = `translate(-50%, -50%) scale(1.2)`;

            setTimeout(() => {
                bubble.remove();
            }, 300); // 300ms is the CSS pop transition time
        }, duration);
    }

    // Attach to workspace click
    workspace.addEventListener('click', (e) => {
        if (tagModeActive && !document.body.classList.contains('mode-present')) {
            spawnHashtags(e);
        }
    });

    // --- Contact Form Modal Logic ---
    const contactBtn = document.getElementById('contactBtn');
    const contactModal = document.getElementById('contactModal');
    const closeContactBtn = document.getElementById('closeContactBtn');
    const contactForm = document.getElementById('contactForm');
    const submitContactBtn = document.getElementById('submitContactBtn');
    const formStatusMsg = document.getElementById('formStatusMsg');

    if (contactBtn && contactModal) {
        // Toggle the form visibility
        contactBtn.addEventListener('click', (e) => {
            e.stopPropagation();

            // Toggle form
            if (contactModal.classList.contains('hidden')) {
                contactModal.classList.remove('hidden');

                // Align dynamically under the button
                const rect = contactBtn.getBoundingClientRect();
                contactModal.style.left = `${rect.left - 140}px`; // Centered slightly
                contactModal.style.top = `${rect.bottom + 8}px`;
            } else {
                contactModal.classList.add('hidden');
            }
        });

        // Close on X
        if (closeContactBtn) {
            closeContactBtn.addEventListener('click', () => {
                contactModal.classList.add('hidden');
            });
        }

        // Close when clicking outside
        document.addEventListener('click', (e) => {
            if (!contactModal.contains(e.target) && !contactBtn.contains(e.target) && !contactModal.classList.contains('hidden')) {
                contactModal.classList.add('hidden');
            }
        });

        // Handle AJAX form submission so page doesn't reload
        if (contactForm) {
            contactForm.addEventListener('submit', async (e) => {
                e.preventDefault();

                const data = new FormData(contactForm);
                submitContactBtn.disabled = true;
                submitContactBtn.innerHTML = '<span class="material-symbols-outlined" style="animation: spin 1s linear infinite;">autorenew</span> Sending...';

                // Little CSS for spinning
                if (!document.getElementById('spinnerStyle')) {
                    const style = document.createElement('style');
                    style.id = 'spinnerStyle';
                    style.innerHTML = `@keyframes spin { 100% { transform: rotate(360deg); } }`;
                    document.head.appendChild(style);
                }

                try {
                    const response = await fetch(contactForm.action, {
                        method: 'POST',
                        body: data,
                        headers: {
                            'Accept': 'application/json'
                        }
                    });

                    if (response.ok) {
                        formStatusMsg.textContent = "Message sent successfully!";
                        formStatusMsg.className = "form-status-msg success";
                        contactForm.reset();

                        // Auto close after 3s
                        setTimeout(() => {
                            contactModal.classList.add('hidden');
                            formStatusMsg.classList.add('hidden');
                        }, 3000);
                    } else {
                        throw new Error('Network response was not ok');
                    }
                } catch (error) {
                    formStatusMsg.textContent = "Oops! Something went wrong.";
                    formStatusMsg.className = "form-status-msg error";
                } finally {
                    formStatusMsg.classList.remove('hidden');
                    submitContactBtn.disabled = false;
                    submitContactBtn.innerHTML = '<span class="material-symbols-outlined">send</span> Send';
                }
            });
        }
    }

});
