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

            // Profile Card outside click handling
            const proExpBtn = document.getElementById('profileExpandBtn');
            const proCard = document.getElementById('profileCard');
            if (proExpBtn && proCard) {
                if (!proExpBtn.contains(e.target) && !proCard.contains(e.target)) {
                    proCard.classList.add('hidden');
                }
            }
        });

        // Profile Card explicit toggle handling
        const proExpBtn = document.getElementById('profileExpandBtn');
        const proCard = document.getElementById('profileCard');
        if (proExpBtn && proCard) {
            proExpBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                proCard.classList.toggle('hidden');
            });
        }

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

        // Wheel and Input logic for zoomLevelText
        if (zoomLevelText) {
            zoomLevelText.addEventListener('wheel', (e) => {
                e.preventDefault();
                e.stopPropagation();

                const zoomFactor = 0.05;
                let newZoom = currentZoom;
                if (e.deltaY > 0) {
                    newZoom -= zoomFactor;
                } else {
                    newZoom += zoomFactor;
                }
                newZoom = Math.max(0.1, Math.min(newZoom, 4));
                applyZoom(newZoom);
            }, { passive: false });

            // Allow typing a custom zoom value
            zoomLevelText.addEventListener('dblclick', (e) => {
                e.stopPropagation();
                zoomLevelText.contentEditable = 'true';
                zoomLevelText.focus();
                document.execCommand('selectAll', false, null);
            });

            zoomLevelText.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    zoomLevelText.blur();
                }
            });

            zoomLevelText.addEventListener('blur', () => {
                zoomLevelText.contentEditable = 'false';
                let val = parseFloat(zoomLevelText.innerText.replace('%', ''));
                if (!isNaN(val)) {
                    val = Math.max(10, Math.min(400, val));
                    applyZoom(val / 100);
                } else {
                    // Reset to old value visually
                    applyZoom(currentZoom);
                }
            });
        }

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

    // --- Tool State Management ---
    let currentTool = 'cursor'; // 'cursor', 'tag', 'text'
    const textBtn = document.getElementById('textBtn');

    function setTool(tool) {
        currentTool = tool;
        if (cursorBtn) cursorBtn.classList.remove('tool-active');
        if (tagBtn) tagBtn.classList.remove('tool-active');
        if (textBtn) textBtn.classList.remove('tool-active');

        workspace.style.cursor = 'default';
        if (artboard) artboard.style.cursor = 'default';

        if (tool === 'cursor') {
            if (cursorBtn) cursorBtn.classList.add('tool-active');
        } else if (tool === 'tag') {
            if (tagBtn) tagBtn.classList.add('tool-active');
            workspace.style.cursor = 'crosshair';
            if (artboard) artboard.style.cursor = 'crosshair';
            clearSelection();
        } else if (tool === 'text') {
            if (textBtn) textBtn.classList.add('tool-active');
            workspace.style.cursor = 'text';
            if (artboard) artboard.style.cursor = 'text';
            clearSelection();
        }
    }

    if (cursorBtn && tagBtn) {
        cursorBtn.addEventListener('click', () => setTool('cursor'));
        tagBtn.addEventListener('click', () => setTool('tag'));
        if (textBtn) textBtn.addEventListener('click', () => setTool('text'));
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
        if (currentTool === 'tag' && !document.body.classList.contains('mode-present')) {
            spawnHashtags(e);
        }
    });

    // --- Text Tool & Selection Mechanisms ---
    let textElements = [];
    let selectedElements = [];

    // Artboard canvas interactions
    let isDrawing = false;
    let startX = 0, startY = 0;
    let currentTempBox = null;

    // Helper to clear selection
    function clearSelection() {
        selectedElements.forEach(el => el.classList.remove('selected'));
        selectedElements = [];
        updatePropertiesPanel();
    }

    function addToSelection(el) {
        if (!selectedElements.includes(el)) {
            selectedElements.push(el);
            el.classList.add('selected');
        }
        updatePropertiesPanel();
    }

    // Artboard coordinates helper (accounts for scale/zoom and bounding rect)
    function getArtboardLocalCoords(e) {
        if (!artboard) return { x: 0, y: 0 };
        const rect = artboard.getBoundingClientRect();
        // currentZoom is from the zoom logic higher up
        const scale = window.currentZoom || 1;
        return {
            x: (e.clientX - rect.left) / scale,
            y: (e.clientY - rect.top) / scale
        };
    }

    if (artboard) {
        artboard.addEventListener('mousedown', (e) => {
            if (document.body.classList.contains('mode-present')) return;

            // If we are clicking on an existing text element, handle selection or editing
            if (e.target.classList.contains('text-element') && currentTool === 'cursor') {
                if (e.shiftKey) {
                    if (selectedElements.includes(e.target)) {
                        selectedElements = selectedElements.filter(el => el !== e.target);
                        e.target.classList.remove('selected');
                        updatePropertiesPanel();
                    } else {
                        addToSelection(e.target);
                    }
                } else {
                    if (!selectedElements.includes(e.target)) {
                        clearSelection();
                        addToSelection(e.target);
                    }
                }
                return; // Let native drag or double-click to edit happen later
            }

            if (currentTool === 'cursor') {
                // Clicked empty space with cursor -> clear selection & start marquee
                clearSelection();
                isDrawing = true;
                const coords = getArtboardLocalCoords(e);
                startX = coords.x;
                startY = coords.y;

                if (!currentTempBox) {
                    currentTempBox = document.createElement('div');
                    currentTempBox.className = 'selection-marquee';
                    artboard.appendChild(currentTempBox);
                }
                currentTempBox.style.left = `${startX}px`;
                currentTempBox.style.top = `${startY}px`;
                currentTempBox.style.width = `0px`;
                currentTempBox.style.height = `0px`;
                currentTempBox.style.display = 'block';
            }
            else if (currentTool === 'text') {
                isDrawing = true;
                const coords = getArtboardLocalCoords(e);
                startX = coords.x;
                startY = coords.y;

                if (!currentTempBox) {
                    // Visual placeholder for the text box being drawn
                    currentTempBox = document.createElement('div');
                    currentTempBox.className = 'selection-marquee';
                    artboard.appendChild(currentTempBox);
                }
                currentTempBox.style.left = `${startX}px`;
                currentTempBox.style.top = `${startY}px`;
                currentTempBox.style.width = `0px`;
                currentTempBox.style.height = `0px`;
                currentTempBox.style.display = 'block';
            }
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDrawing || !currentTempBox || document.body.classList.contains('mode-present')) return;

            const coords = getArtboardLocalCoords(e);
            const currentX = coords.x;
            const currentY = coords.y;

            const x = Math.min(startX, currentX);
            const y = Math.min(startY, currentY);
            const w = Math.abs(currentX - startX);
            const h = Math.abs(currentY - startY);

            currentTempBox.style.left = `${x}px`;
            currentTempBox.style.top = `${y}px`;
            currentTempBox.style.width = `${w}px`;
            currentTempBox.style.height = `${h}px`;

            if (currentTool === 'cursor') {
                // Marquee selection logic
                const boxRect = { left: x, top: y, right: x + w, bottom: y + h };

                // Unselect all temporarily, then re-select intersecting
                selectedElements.forEach(el => el.classList.remove('selected'));
                let newSelection = [];

                textElements.forEach(textEl => {
                    const l = parseFloat(textEl.style.left);
                    const t = parseFloat(textEl.style.top);
                    const r = l + textEl.offsetWidth;
                    const b = t + textEl.offsetHeight;

                    // Check intersection
                    if (boxRect.left < r && boxRect.right > l && boxRect.top < b && boxRect.bottom > t) {
                        newSelection.push(textEl);
                        textEl.classList.add('selected');
                    }
                });
                selectedElements = newSelection;
                updatePropertiesPanel();
            }
        });

        document.addEventListener('mouseup', (e) => {
            if (!isDrawing || document.body.classList.contains('mode-present')) return;
            isDrawing = false;

            if (currentTempBox) {
                currentTempBox.style.display = 'none';
            }

            if (currentTool === 'text') {
                const coords = getArtboardLocalCoords(e);
                const currentX = coords.x;
                const currentY = coords.y;

                const x = Math.min(startX, currentX);
                const y = Math.min(startY, currentY);
                const w = Math.abs(currentX - startX);
                const h = Math.abs(currentY - startY);

                createNewTextElement(x, y, w, h);
                // Return to cursor automatically after creating text
                setTool('cursor');
            }
        });
    }

    function createNewTextElement(x, y, w, h) {
        const textEl = document.createElement('div');
        textEl.className = 'text-element';
        textEl.contentEditable = "true";

        textEl.style.left = `${x}px`;
        textEl.style.top = `${y}px`;

        // If drawn box is tiny (just a click), it's auto sizing point text
        if (w < 10 && h < 10) {
            textEl.style.width = 'auto';
            textEl.style.height = 'auto';
            textEl.dataset.type = 'point';
        } else {
            // Drawn specifically
            textEl.style.width = `${Math.max(w, 50)}px`;
            textEl.style.height = `${Math.max(h, 20)}px`;
            textEl.dataset.type = 'box';
        }

        const propFontSize = document.getElementById('propFontSize');
        if (propFontSize) textEl.style.fontSize = `${propFontSize.value}px`;

        // Apply default colors
        const defaultFillHex = document.getElementById('fillColorHex') ? '#' + document.getElementById('fillColorHex').textContent : '#333333';
        const defaultFillAlpha = document.getElementById('fillColorAlpha') ? document.getElementById('fillColorAlpha').value : '100';
        const defaultStrokeHex = document.getElementById('strokeColorHex') ? '#' + document.getElementById('strokeColorHex').textContent : 'transparent';
        const defaultStrokeAlpha = document.getElementById('strokeColorAlpha') ? document.getElementById('strokeColorAlpha').value : '100';
        const defaultStrokeWidth = document.getElementById('propStrokeSize') ? document.getElementById('propStrokeSize').value : 0;

        textEl.style.color = getHexAlphaColor(defaultFillHex, defaultFillAlpha);
        textEl.style.webkitTextStrokeColor = getHexAlphaColor(defaultStrokeHex, defaultStrokeAlpha);
        textEl.style.webkitTextStrokeWidth = `${defaultStrokeWidth}px`;

        artboard.appendChild(textEl);
        textElements.push(textEl);

        // Immediate focus for typing
        setTimeout(() => {
            textEl.focus();
            clearSelection();
            addToSelection(textEl);
        }, 10);

        // Manage fading and removal
        textEl.addEventListener('blur', () => {
            if (textEl.textContent.trim() === '') {
                // Remove if empty
                textEl.remove();
                textElements = textElements.filter(el => el !== textEl);
                selectedElements = selectedElements.filter(el => el !== textEl);
                updatePropertiesPanel();
            } else {
                // 1 minute fadeout
                setTimeout(() => {
                    textEl.style.opacity = '0';
                    setTimeout(() => {
                        textEl.remove();
                        textElements = textElements.filter(el => el !== textEl);
                        selectedElements = selectedElements.filter(el => el !== textEl);
                        updatePropertiesPanel();
                    }, 2000); // Wait for transition CSS
                }, 60000);
            }
        });

        // When clicked again (while we are in cursor mode), we might edit it
        textEl.addEventListener('dblclick', (e) => {
            if (currentTool === 'cursor') {
                e.stopPropagation();
                textEl.focus();
                // Select all text natively
                document.execCommand('selectAll', false, null);
            }
        });
    }

    // --- Properties Panel Synchronization & Alignment ---
    const propX = document.getElementById('propX');
    const propY = document.getElementById('propY');
    const propW = document.getElementById('propW');
    const propH = document.getElementById('propH');
    const propFontSize = document.getElementById('propFontSize');
    const propStrokeSize = document.getElementById('propStrokeSize');

    const fillColorInput = document.getElementById('fillColorInput');
    const fillColorHex = document.getElementById('fillColorHex');
    const fillColorAlpha = document.getElementById('fillColorAlpha');

    const strokeColorInput = document.getElementById('strokeColorInput');
    const strokeColorHex = document.getElementById('strokeColorHex');
    const strokeColorAlpha = document.getElementById('strokeColorAlpha');

    function getHexAlphaColor(hexStr, alphaPercent) {
        if (!hexStr || hexStr === 'transparent' || hexStr === '#TRANSPARENT') return 'transparent';
        let alpha = parseInt(alphaPercent);
        if (isNaN(alpha)) alpha = 100;
        let alphaHex = Math.round((alpha / 100) * 255).toString(16).padStart(2, '0');
        return `${hexStr}${alphaHex}`;
    }

    const colToHexAlpha = (col) => {
        if (!col || col === 'transparent' || col === 'rgba(0, 0, 0, 0)') return { hex: '#TRANSPARENT', alpha: 100 };

        let parsedCol = col;
        if (!parsedCol.startsWith('rgb')) {
            const temp = document.createElement('div');
            temp.style.color = col;
            document.body.appendChild(temp);
            parsedCol = window.getComputedStyle(temp).color;
            temp.remove();
        }

        if (parsedCol.startsWith('rgba')) {
            const a = parsedCol.split("(")[1].split(")")[0].split(",");
            const r = parseInt(a[0].trim()).toString(16).padStart(2, '0');
            const g = parseInt(a[1].trim()).toString(16).padStart(2, '0');
            const b = parseInt(a[2].trim()).toString(16).padStart(2, '0');
            const alpha = Math.round(parseFloat(a[3].trim()) * 100);
            return { hex: `#${r}${g}${b}`.toUpperCase(), alpha: alpha };
        } else if (parsedCol.startsWith('rgb')) {
            const a = parsedCol.split("(")[1].split(")")[0].split(",");
            const r = parseInt(a[0].trim()).toString(16).padStart(2, '0');
            const g = parseInt(a[1].trim()).toString(16).padStart(2, '0');
            const b = parseInt(a[2].trim()).toString(16).padStart(2, '0');
            return { hex: `#${r}${g}${b}`.toUpperCase(), alpha: 100 };
        }
        return { hex: '#000000', alpha: 100 };
    };

    function updatePropertiesPanel() {
        if (selectedElements.length === 0) {
            return;
        }

        if (selectedElements.length === 1) {
            const el = selectedElements[0];
            if (propX) propX.value = Math.round(parseFloat(el.style.left)) || 0;
            if (propY) propY.value = Math.round(parseFloat(el.style.top)) || 0;
            if (propW) propW.value = Math.round(el.offsetWidth) || 0;
            if (propH) propH.value = Math.round(el.offsetHeight) || 0;
            if (propFontSize) propFontSize.value = Math.round(parseFloat(window.getComputedStyle(el).fontSize)) || 16;
            if (propStrokeSize) propStrokeSize.value = parseFloat(el.style.webkitTextStrokeWidth) || 0;

            if (el.style.color) {
                const ca = colToHexAlpha(el.style.color);
                if (fillColorInput && ca.hex !== '#TRANSPARENT') fillColorInput.value = ca.hex;
                if (fillColorHex) fillColorHex.textContent = ca.hex.replace('#', '');
                if (fillColorAlpha) fillColorAlpha.value = ca.alpha;
            }

            const strokeColor = el.style.webkitTextStrokeColor || 'transparent';
            if (strokeColor !== 'transparent' && strokeColor !== 'rgba(0, 0, 0, 0)') {
                const ca = colToHexAlpha(strokeColor);
                if (strokeColorInput && ca.hex !== '#TRANSPARENT') strokeColorInput.value = ca.hex;
                if (strokeColorHex) strokeColorHex.textContent = ca.hex.replace('#', '');
                if (strokeColorAlpha) strokeColorAlpha.value = ca.alpha;
            } else {
                if (strokeColorAlpha) strokeColorAlpha.value = 0;
            }
        } else {
            // Multiple elements selected, clear inputs
            if (propX) propX.value = "";
            if (propY) propY.value = "";
            if (propW) propW.value = "";
            if (propH) propH.value = "";
            if (propFontSize) propFontSize.value = "";
            if (propStrokeSize) propStrokeSize.value = "";
        }
    }

    // Apply properties when input changes
    function applyPropertyUpdate(prop, value) {
        selectedElements.forEach(el => {
            if (prop === 'x') el.style.left = `${value}px`;
            if (prop === 'y') el.style.top = `${value}px`;
            if (prop === 'w') {
                el.style.width = `${value}px`;
                el.dataset.type = 'box'; // switch to fixed box
            }
            if (prop === 'h') {
                el.style.height = `${value}px`;
                el.dataset.type = 'box'; // switch to fixed box
            }
            if (prop === 'size') {
                el.style.fontSize = `${value}px`;
            }
            if (prop === 'fill') {
                const alpha = fillColorAlpha ? fillColorAlpha.value : 100;
                el.style.color = getHexAlphaColor(value, alpha);
            }
            if (prop === 'fillAlpha') {
                const hex = fillColorInput ? fillColorInput.value : '#000000';
                el.style.color = getHexAlphaColor(hex, value);
            }
            if (prop === 'strokeSize') {
                el.style.webkitTextStrokeWidth = `${value}px`;
            }
            if (prop === 'stroke') {
                const alpha = strokeColorAlpha ? strokeColorAlpha.value : 100;
                el.style.webkitTextStrokeColor = getHexAlphaColor(value, alpha);
            }
            if (prop === 'strokeAlpha') {
                const hex = strokeColorInput ? strokeColorInput.value : '#000000';
                el.style.webkitTextStrokeColor = getHexAlphaColor(hex, value);
            }
        });
    }

    if (propX) propX.addEventListener('input', (e) => applyPropertyUpdate('x', e.target.value));
    if (propY) propY.addEventListener('input', (e) => applyPropertyUpdate('y', e.target.value));
    if (propW) propW.addEventListener('input', (e) => applyPropertyUpdate('w', e.target.value));
    if (propH) propH.addEventListener('input', (e) => applyPropertyUpdate('h', e.target.value));
    if (propFontSize) propFontSize.addEventListener('input', (e) => applyPropertyUpdate('size', e.target.value));
    if (propStrokeSize) propStrokeSize.addEventListener('input', (e) => applyPropertyUpdate('strokeSize', e.target.value));

    if (fillColorInput) {
        fillColorInput.addEventListener('input', (e) => {
            const hex = e.target.value.toUpperCase();
            if (fillColorHex) fillColorHex.textContent = hex.replace('#', '');
            applyPropertyUpdate('fill', hex);
        });
    }
    if (fillColorAlpha) {
        fillColorAlpha.addEventListener('input', (e) => applyPropertyUpdate('fillAlpha', e.target.value));
    }

    if (strokeColorInput) {
        strokeColorInput.addEventListener('input', (e) => {
            const hex = e.target.value.toUpperCase();
            if (strokeColorHex) strokeColorHex.textContent = hex.replace('#', '');
            applyPropertyUpdate('stroke', hex);
        });
    }
    if (strokeColorAlpha) {
        strokeColorAlpha.addEventListener('input', (e) => applyPropertyUpdate('strokeAlpha', e.target.value));
    }

    // --- Number Input Wheel Scroll Logic ---
    function setupNumberInputWheel(inputEl) {
        if (!inputEl) return;
        inputEl.addEventListener('wheel', (e) => {
            if (document.activeElement !== inputEl) return; // Only if focused
            e.preventDefault(); // Stop page scroll

            const step = parseFloat(inputEl.getAttribute('step')) || 1;
            const min = inputEl.hasAttribute('min') ? parseFloat(inputEl.getAttribute('min')) : -Infinity;
            const max = inputEl.hasAttribute('max') ? parseFloat(inputEl.getAttribute('max')) : Infinity;

            let val = parseFloat(inputEl.value) || 0;
            // deltaY > 0 is scroll down (decrease), deltaY < 0 is scroll up (increase)
            const direction = e.deltaY > 0 ? -1 : 1;

            val += direction * step;
            val = Math.max(min, Math.min(max, val));

            inputEl.value = val;
            // Manually trigger input event so applyPropertyUpdate fires
            inputEl.dispatchEvent(new Event('input'));
        });
    }

    setupNumberInputWheel(propX);
    setupNumberInputWheel(propY);
    setupNumberInputWheel(propW);
    setupNumberInputWheel(propH);
    setupNumberInputWheel(propFontSize);
    setupNumberInputWheel(propStrokeSize);
    setupNumberInputWheel(fillColorAlpha);
    setupNumberInputWheel(strokeColorAlpha);

    // --- Alignment Logic ---
    const alignBtns = {
        left: document.getElementById('alignLeftBtn'),
        center: document.getElementById('alignCenterBtn'),
        right: document.getElementById('alignRightBtn'),
        top: document.getElementById('alignTopBtn'),
        middle: document.getElementById('alignMiddleBtn'),
        bottom: document.getElementById('alignBottomBtn')
    };

    function alignElements(type) {
        if (selectedElements.length === 0) return;

        if (selectedElements.length === 1) {
            // Align relative to artboard
            const el = selectedElements[0];
            const artW = artboard.clientWidth;
            const artH = artboard.clientHeight;
            const elW = el.offsetWidth;
            const elH = el.offsetHeight;

            switch (type) {
                case 'left': el.style.left = '0px'; break;
                case 'center': el.style.left = `${(artW - elW) / 2}px`; break;
                case 'right': el.style.left = `${artW - elW}px`; break;
                case 'top': el.style.top = '0px'; break;
                case 'middle': el.style.top = `${(artH - elH) / 2}px`; break;
                case 'bottom': el.style.top = `${artH - elH}px`; break;
            }
            updatePropertiesPanel();
        } else {
            // Align multiple elements relative to their bounding box
            let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

            selectedElements.forEach(el => {
                const l = parseFloat(el.style.left) || 0;
                const t = parseFloat(el.style.top) || 0;
                const r = l + el.offsetWidth;
                const b = t + el.offsetHeight;
                if (l < minX) minX = l;
                if (t < minY) minY = t;
                if (r > maxX) maxX = r;
                if (b > maxY) maxY = b;
            });

            const midX = (minX + maxX) / 2;
            const midY = (minY + maxY) / 2;

            selectedElements.forEach(el => {
                switch (type) {
                    case 'left': el.style.left = `${minX}px`; break;
                    case 'center': el.style.left = `${midX - el.offsetWidth / 2}px`; break;
                    case 'right': el.style.left = `${maxX - el.offsetWidth}px`; break;
                    case 'top': el.style.top = `${minY}px`; break;
                    case 'middle': el.style.top = `${midY - el.offsetHeight / 2}px`; break;
                    case 'bottom': el.style.top = `${maxY - el.offsetHeight}px`; break;
                }
            });
            updatePropertiesPanel();
        }
    }

    if (alignBtns.left) alignBtns.left.addEventListener('click', () => alignElements('left'));
    if (alignBtns.center) alignBtns.center.addEventListener('click', () => alignElements('center'));
    if (alignBtns.right) alignBtns.right.addEventListener('click', () => alignElements('right'));
    if (alignBtns.top) alignBtns.top.addEventListener('click', () => alignElements('top'));
    if (alignBtns.middle) alignBtns.middle.addEventListener('click', () => alignElements('middle'));
    if (alignBtns.bottom) alignBtns.bottom.addEventListener('click', () => alignElements('bottom'));

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
