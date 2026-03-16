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

    // --- Canvas Pan + Zoom System ---
    const zoomContainer = document.getElementById('zoomContainer');
    const zoomLevelBtn = document.getElementById('zoomLevelBtn');
    const zoomLevelText = document.getElementById('zoomLevelText');
    const zoomMenu = document.getElementById('zoomMenu');
    const canvasSection = document.getElementById('canvas');
    const canvasViewport = document.getElementById('canvasViewport');

    let canvasZoom = 1;
    let canvasPanX = 0;
    let canvasPanY = 0;

    const FRAME_POSITIONS = {
        'wrapper-portfolio-artboard': { x: 0,     y: 0    },
        'wrapper-project-1':         { x: 0,  y: -1500 },
        'wrapper-project-2':         { x: -2000,    y: -3000 },
        'wrapper-project-3':         { x: 4000,   y: -900 },
        'wrapper-project-4':         { x: -3000,  y: -700  },
        'wrapper-project-5':         { x: 1800,   y: 250  },
        'wrapper-project-7':         { x: -3000,  y: 4000 },
        'wrapper-project-8':         { x: -2000,    y: 800 },
        'wrapper-project-9':         { x: 1600,   y: 2500 },
        'wrapper-project-10':        { x: -800,  y: 3500 },
        'wrapper-project-11':        { x: 3000,    y: -4000 },
        'wrapper-project-12':        { x: -12000,   y: 1650 },
    };

    function applyCanvasTransform() {
        if (!canvasViewport) return;
        canvasViewport.style.transform = `translate(${canvasPanX}px, ${canvasPanY}px) scale(${canvasZoom})`;
        if (zoomLevelText) {
            zoomLevelText.textContent = `${Math.round(canvasZoom * 100)}%`;
        }
    }

    function initCanvasPositions() {
        Object.entries(FRAME_POSITIONS).forEach(([id, pos]) => {
            const el = document.getElementById(id);
            if (el) {
                el.style.left = pos.x + 'px';
                el.style.top = pos.y + 'px';
            }
        });
    }

    function initCanvasView() {
        if (!canvasSection) return;
        const w = canvasSection.clientWidth;
        const artboardW = 1200;
        const fitZoom = Math.min(1, (w - 80) / artboardW);
        canvasZoom = fitZoom;
        canvasPanX = (w - artboardW * canvasZoom) / 2;
        canvasPanY = 80;
        applyCanvasTransform();
    }

    function navigateTo(wrapperId) {
        if (!canvasSection) return;
        const pos = FRAME_POSITIONS[wrapperId];
        if (!pos) return;
        const w = canvasSection.clientWidth;
        const h = canvasSection.clientHeight;
        const artboardW = 1200;
        const targetZoom = Math.min(1, (w - 120) / artboardW);
        canvasZoom = targetZoom;
        canvasPanX = w / 2 - (pos.x + artboardW / 2) * canvasZoom;
        canvasPanY = h / 2 - (pos.y + 400) * canvasZoom;
        applyCanvasTransform();
    }

    initCanvasPositions();
    setTimeout(initCanvasView, 50);

    if (zoomContainer && zoomMenu && zoomLevelBtn) {
        zoomLevelBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            zoomMenu.classList.toggle('hidden');
        });

        document.addEventListener('click', (e) => {
            if (!zoomContainer.contains(e.target)) {
                zoomMenu.classList.add('hidden');
            }

            const proExpBtn = document.getElementById('profileExpandBtn');
            const proCard = document.getElementById('profileCard');
            if (proExpBtn && proCard) {
                if (!proExpBtn.contains(e.target) && !proCard.contains(e.target)) {
                    proCard.classList.add('hidden');
                }
            }

            const shareBtn = document.getElementById('shareBtn');
            const shareCard = document.getElementById('shareCard');
            if (shareBtn && shareCard) {
                if (!shareBtn.contains(e.target) && !shareCard.contains(e.target)) {
                    shareCard.classList.add('hidden');
                }
            }
        });

        const proExpBtn = document.getElementById('profileExpandBtn');
        const proCard = document.getElementById('profileCard');
        if (proExpBtn && proCard) {
            proExpBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                proCard.classList.toggle('hidden');
            });
        }

        const shareBtn = document.getElementById('shareBtn');
        const shareCard = document.getElementById('shareCard');
        if (shareBtn && shareCard) {
            shareBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                shareCard.classList.toggle('hidden');
            });

            const socialBtns = shareCard.querySelectorAll('.social-btn');
            socialBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    const network = btn.getAttribute('data-network');
                    const url = encodeURIComponent(window.location.protocol === 'file:' ? 'https://david-damore-portfolio.design' : window.location.href);
                    const title = encodeURIComponent("Découvrez le portfolio de David D'AMORE, UX/UI Designer !");
                    let shareUrl = '';
                    switch (network) {
                        case 'linkedin':
                            shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
                            break;
                        case 'twitter':
                            shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
                            break;
                        case 'facebook':
                            shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
                            break;
                        case 'whatsapp':
                            shareUrl = `https://api.whatsapp.com/send?text=${title} - ${url}`;
                            break;
                        case 'email':
                            shareUrl = `mailto:?subject=${title}&body=${encodeURIComponent("Je tenais à partager ce super portfolio avec toi : ")}${url}`;
                            break;
                    }
                    if (shareUrl) {
                        window.open(shareUrl, network === 'email' ? '_self' : '_blank');
                    }
                });
            });
        }

        const zoomOptions = zoomMenu.querySelectorAll('.zoom-option');
        zoomOptions.forEach(option => {
            option.addEventListener('click', () => {
                const zoom = option.getAttribute('data-zoom');
                if (zoom === 'fit') {
                    initCanvasView();
                } else {
                    const cx = canvasSection ? canvasSection.clientWidth / 2 : window.innerWidth / 2;
                    const cy = canvasSection ? canvasSection.clientHeight / 2 : window.innerHeight / 2;
                    const worldX = (cx - canvasPanX) / canvasZoom;
                    const worldY = (cy - canvasPanY) / canvasZoom;
                    canvasZoom = Math.max(0.05, Math.min(4, parseFloat(zoom)));
                    canvasPanX = cx - worldX * canvasZoom;
                    canvasPanY = cy - worldY * canvasZoom;
                    applyCanvasTransform();
                }
                zoomMenu.classList.add('hidden');
            });
        });

        if (zoomLevelText) {
            zoomLevelText.addEventListener('wheel', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const delta = e.deltaY > 0 ? -0.1 : 0.1;
                const cx = canvasSection ? canvasSection.clientWidth / 2 : window.innerWidth / 2;
                const cy = canvasSection ? canvasSection.clientHeight / 2 : window.innerHeight / 2;
                const worldX = (cx - canvasPanX) / canvasZoom;
                const worldY = (cy - canvasPanY) / canvasZoom;
                canvasZoom = Math.max(0.1, Math.min(4, canvasZoom + delta));
                canvasPanX = cx - worldX * canvasZoom;
                canvasPanY = cy - worldY * canvasZoom;
                applyCanvasTransform();
            }, { passive: false });

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
                    const cx = canvasSection ? canvasSection.clientWidth / 2 : window.innerWidth / 2;
                    const cy = canvasSection ? canvasSection.clientHeight / 2 : window.innerHeight / 2;
                    const worldX = (cx - canvasPanX) / canvasZoom;
                    const worldY = (cy - canvasPanY) / canvasZoom;
                    canvasZoom = val / 100;
                    canvasPanX = cx - worldX * canvasZoom;
                    canvasPanY = cy - worldY * canvasZoom;
                    applyCanvasTransform();
                } else {
                    applyCanvasTransform();
                }
            });
        }

        if (canvasSection) {
            canvasSection.addEventListener('wheel', (e) => {
                e.preventDefault();
                if (e.ctrlKey || e.metaKey) {
                    const rect = canvasSection.getBoundingClientRect();
                    const mouseX = e.clientX - rect.left;
                    const mouseY = e.clientY - rect.top;
                    const worldX = (mouseX - canvasPanX) / canvasZoom;
                    const worldY = (mouseY - canvasPanY) / canvasZoom;
                    const factor = e.deltaY < 0 ? 1.1 : 0.9;
                    canvasZoom = Math.max(0.05, Math.min(4, canvasZoom * factor));
                    canvasPanX = mouseX - worldX * canvasZoom;
                    canvasPanY = mouseY - worldY * canvasZoom;
                } else {
                    canvasPanX -= e.deltaX;
                    canvasPanY -= e.deltaY;
                }
                applyCanvasTransform();
            }, { passive: false });

            let isPanning = false;
            let panStartX = 0;
            let panStartY = 0;
            let spaceDown = false;

            document.addEventListener('keydown', (e) => {
                if (e.code === 'Space' && !e.target.matches('input, textarea, [contenteditable]')) {
                    e.preventDefault();
                    spaceDown = true;
                    canvasSection.style.cursor = 'grab';
                }
            });
            document.addEventListener('keyup', (e) => {
                if (e.code === 'Space') {
                    spaceDown = false;
                    if (!isPanning) canvasSection.style.cursor = '';
                }
            });

            canvasSection.addEventListener('pointerdown', (e) => {
                if (e.button === 1 || (e.button === 0 && spaceDown)) {
                    e.preventDefault();
                    isPanning = true;
                    panStartX = e.clientX - canvasPanX;
                    panStartY = e.clientY - canvasPanY;
                    canvasSection.style.cursor = 'grabbing';
                    canvasSection.setPointerCapture(e.pointerId);
                }
            });
            canvasSection.addEventListener('pointermove', (e) => {
                if (!isPanning) return;
                canvasPanX = e.clientX - panStartX;
                canvasPanY = e.clientY - panStartY;
                applyCanvasTransform();
            });
            canvasSection.addEventListener('pointerup', () => {
                if (isPanning) {
                    isPanning = false;
                    canvasSection.style.cursor = spaceDown ? 'grab' : '';
                }
            });

            let lastTouchDist = null;
            let lastTouchPanX = 0;
            let lastTouchPanY = 0;

            canvasSection.addEventListener('touchstart', (e) => {
                if (e.touches.length === 2) {
                    const dx = e.touches[1].clientX - e.touches[0].clientX;
                    const dy = e.touches[1].clientY - e.touches[0].clientY;
                    lastTouchDist = Math.hypot(dx, dy);
                } else if (e.touches.length === 1) {
                    lastTouchPanX = e.touches[0].clientX - canvasPanX;
                    lastTouchPanY = e.touches[0].clientY - canvasPanY;
                }
            }, { passive: true });
            canvasSection.addEventListener('touchmove', (e) => {
                e.preventDefault();
                if (e.touches.length === 2) {
                    const dx = e.touches[1].clientX - e.touches[0].clientX;
                    const dy = e.touches[1].clientY - e.touches[0].clientY;
                    const dist = Math.hypot(dx, dy);
                    const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
                    const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
                    const rect = canvasSection.getBoundingClientRect();
                    const mx = midX - rect.left;
                    const my = midY - rect.top;
                    const worldX = (mx - canvasPanX) / canvasZoom;
                    const worldY = (my - canvasPanY) / canvasZoom;
                    canvasZoom = Math.max(0.05, Math.min(4, canvasZoom * (dist / lastTouchDist)));
                    canvasPanX = mx - worldX * canvasZoom;
                    canvasPanY = my - worldY * canvasZoom;
                    lastTouchDist = dist;
                    applyCanvasTransform();
                } else if (e.touches.length === 1) {
                    canvasPanX = e.touches[0].clientX - lastTouchPanX;
                    canvasPanY = e.touches[0].clientY - lastTouchPanY;
                    applyCanvasTransform();
                }
            }, { passive: false });
            canvasSection.addEventListener('touchend', () => {
                lastTouchDist = null;
            });
        }
    }

    // --- Projects Slideshow Mode ---

    const slideshowOverlay = document.getElementById('projectsSlideshow');
    const slideshowTrack = document.getElementById('slideshowTrack');
    const slideshowDotsNav = document.getElementById('slideshowDots');

    const PROJECT_WRAPPER_IDS = [
        'wrapper-project-1', 'wrapper-project-2', 'wrapper-project-3',
        'wrapper-project-4', 'wrapper-project-5', 'wrapper-project-7',
        'wrapper-project-8', 'wrapper-project-9', 'wrapper-project-10',
        'wrapper-project-11', 'wrapper-project-12'
    ];

    function buildSlideshowSections() {
        slideshowTrack.innerHTML = '';
        slideshowDotsNav.innerHTML = '';

        PROJECT_WRAPPER_IDS.forEach((wrapperId, idx) => {
            const wrapper = document.getElementById(wrapperId);
            if (!wrapper) return;

            const artboardEl = wrapper.querySelector('.project-artboard');
            const titleEl = wrapper.querySelector('.project-title');
            const projectTitle = titleEl ? titleEl.textContent.trim() : wrapperId;

            const section = document.createElement('div');
            section.className = 'slideshow-section';
            section.dataset.index = idx;

            const header = document.createElement('div');
            header.className = 'slideshow-section-header';
            header.innerHTML = `<span class="slideshow-section-num">Projet ${String(idx + 1).padStart(2, '0')}</span>`;

            const containerClone = artboardEl ? artboardEl.querySelector('.project-container').cloneNode(true) : document.createElement('div');

            section.appendChild(header);
            section.appendChild(containerClone);
            slideshowTrack.appendChild(section);

            const dot = document.createElement('button');
            dot.className = 'slideshow-dot';
            dot.title = projectTitle;
            dot.addEventListener('click', () => {
                section.scrollIntoView({ behavior: 'smooth' });
            });
            slideshowDotsNav.appendChild(dot);
        });

        initSlideshows(slideshowTrack);
        updateActiveDot();
    }

    function updateActiveDot() {
        const dots = slideshowDotsNav.querySelectorAll('.slideshow-dot');
        const sections = slideshowTrack.querySelectorAll('.slideshow-section');
        const trackScrollTop = slideshowTrack.scrollTop;
        const trackHeight = slideshowTrack.clientHeight;

        let activeIdx = 0;
        sections.forEach((section, idx) => {
            if (section.offsetTop <= trackScrollTop + trackHeight / 2) {
                activeIdx = idx;
            }
        });

        dots.forEach((dot, i) => dot.classList.toggle('active', i === activeIdx));
    }

    function enterProjectsSlideshow() {
        buildSlideshowSections();
        slideshowOverlay.classList.remove('hidden');
        exitPresentBtn.classList.remove('hidden');
        slideshowTrack.scrollTop = 0;
        slideshowTrack.addEventListener('scroll', updateActiveDot);
    }

    function exitProjectsSlideshow() {
        slideshowOverlay.classList.add('hidden');
        exitPresentBtn.classList.add('hidden');
        slideshowTrack.removeEventListener('scroll', updateActiveDot);
    }

    presentBtn.addEventListener('click', enterProjectsSlideshow);
    exitPresentBtn.addEventListener('click', exitProjectsSlideshow);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !slideshowOverlay.classList.contains('hidden')) {
            exitProjectsSlideshow();
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

    // --- Left Sidebar Tabs Logic ---
    const tabFile = document.getElementById('tabFile');
    const tabAssets = document.getElementById('tabAssets');
    const contentFile = document.getElementById('contentFile');
    const contentAssets = document.getElementById('contentAssets');

    if (tabFile && tabAssets && contentFile && contentAssets) {
        tabFile.addEventListener('click', () => {
            tabFile.classList.add('active');
            tabAssets.classList.remove('active');
            contentFile.classList.remove('hidden');
            contentAssets.classList.add('hidden');
        });
        tabAssets.addEventListener('click', () => {
            tabAssets.classList.add('active');
            tabFile.classList.remove('active');
            contentAssets.classList.remove('hidden');
            contentFile.classList.add('hidden');
        });
    }

    // --- Right Sidebar Tabs Logic ---
    const tabDesignRight = document.getElementById('tabDesignRight');
    const tabPrototypeRight = document.getElementById('tabPrototypeRight');
    const tabInspectRight = document.getElementById('tabInspectRight');
    const contentDesignRight = document.getElementById('contentDesignRight');
    const contentPrototypeRight = document.getElementById('contentPrototypeRight');
    const contentInspectRight = document.getElementById('contentInspectRight');

    if (tabDesignRight && tabPrototypeRight && tabInspectRight) {
        const resetRightTabs = () => {
            tabDesignRight.classList.remove('active');
            tabPrototypeRight.classList.remove('active');
            tabInspectRight.classList.remove('active');
            contentDesignRight?.classList.add('hidden');
            contentPrototypeRight?.classList.add('hidden');
            contentInspectRight?.classList.add('hidden');
        };

        tabDesignRight.addEventListener('click', () => {
            resetRightTabs();
            tabDesignRight.classList.add('active');
            contentDesignRight?.classList.remove('hidden');
        });

        tabPrototypeRight.addEventListener('click', () => {
            resetRightTabs();
            tabPrototypeRight.classList.add('active');
            contentPrototypeRight?.classList.remove('hidden');
        });

        tabInspectRight.addEventListener('click', () => {
            resetRightTabs();
            tabInspectRight.classList.add('active');
            contentInspectRight?.classList.remove('hidden');
        });
    }

    // --- Before/After Identity Slider Logic ---
    const identitySlider = document.getElementById('identitySlider');
    const baOverlayImg = document.getElementById('baOverlayImg');
    const baHandle = document.getElementById('baHandle');

    if (identitySlider && baOverlayImg && baHandle) {
        let isDragging = false;

        const moveSlider = (clientX) => {
            const rect = identitySlider.getBoundingClientRect();
            // Calculate relative X position
            let x = clientX - rect.left;
            // Constrain to slider bounds
            x = Math.max(0, Math.min(rect.width, x));

            // Convert to percentage
            const percent = (x / rect.width) * 100;

            // Adjust Handle position
            baHandle.style.left = `${percent}%`;
            // Adjust clip-path inset(top right bottom left) -> right is 100 - percent
            baOverlayImg.style.clipPath = `inset(0 ${100 - percent}% 0 0)`;
        };

        const onStart = (e) => {
            // Prevent default browser behaviors like native dragging or text selection
            if (e.cancelable) e.preventDefault();
            isDragging = true;
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            moveSlider(clientX);
        };

        const onMove = (e) => {
            if (!isDragging) return;
            // Prevent default here too for touch devices (prevents page scrolling while sliding)
            if (e.cancelable) e.preventDefault();
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            moveSlider(clientX);
        };

        const onEnd = () => {
            isDragging = false;
        };

        // Note: active listeners (non-passive) are needed to correctly preventDefault on touch events
        identitySlider.addEventListener('mousedown', onStart);
        identitySlider.addEventListener('touchstart', onStart, { passive: false });

        document.addEventListener('mousemove', onMove);
        document.addEventListener('touchmove', onMove, { passive: false });

        document.addEventListener('mouseup', onEnd);
        document.addEventListener('touchend', onEnd);
    }

    // --- Inspect Tab Scanner Logic ---
    const scannerContainer = document.getElementById('scannerContainer');
    const scannerImage = document.getElementById('scannerImage');
    const scannerTextLayer = document.getElementById('scannerTextLayer');
    const scannerRing = document.getElementById('scannerRing');

    if (scannerContainer && scannerImage && scannerTextLayer && scannerRing) {

        const updateScanner = (e) => {
            const rect = scannerContainer.getBoundingClientRect();
            // Works for both mouse and touch events
            const clientX = e.clientX ?? (e.touches && e.touches[0].clientX);
            const clientY = e.clientY ?? (e.touches && e.touches[0].clientY);

            if (clientX === undefined || clientY === undefined) return;

            const x = clientX - rect.left;
            const y = clientY - rect.top;

            // Check if hovering over the actual image element
            // (the transparent borders of the image still count as the image DOM element)
            if (e.target === scannerImage) {
                scannerTextLayer.style.opacity = '1';
                scannerRing.style.opacity = '1';

                const radius = 60; // Half of 120px ring width
                scannerTextLayer.style.clipPath = `circle(${radius}px at ${x}px ${y}px)`;

                scannerRing.style.left = `${x}px`;
                scannerRing.style.top = `${y}px`;
            } else {
                scannerTextLayer.style.opacity = '0';
                scannerRing.style.opacity = '0';
            }
        };

        scannerContainer.addEventListener('mousemove', updateScanner);
        scannerContainer.addEventListener('touchmove', updateScanner, { passive: true });

        scannerContainer.addEventListener('mouseleave', () => {
            scannerTextLayer.style.opacity = '0';
            scannerRing.style.opacity = '0';
        });

        scannerContainer.addEventListener('touchend', () => {
            scannerTextLayer.style.opacity = '0';
            scannerRing.style.opacity = '0';
        });
    }

    // --- Layers Panel Toggle Logic ---
    const layerDesktopFolder = document.getElementById('layerDesktopFolder');
    const layerDesktopChildren = document.getElementById('layerDesktopChildren');
    const layerDesktopToggleIcon = document.getElementById('layerDesktopToggleIcon');

    if (layerDesktopFolder && layerDesktopChildren && layerDesktopToggleIcon) {
        // Toggle open/close logic
        layerDesktopFolder.addEventListener('click', (e) => {
            // Prevent selection if clicking the folder itself instead of text; we'll just toggle for now
            layerDesktopFolder.classList.toggle('open');
            const isOpen = layerDesktopFolder.classList.contains('open');

            if (isOpen) {
                layerDesktopChildren.classList.remove('hidden');
                layerDesktopToggleIcon.textContent = 'keyboard_arrow_down';
            } else {
                layerDesktopChildren.classList.add('hidden');
                layerDesktopToggleIcon.textContent = 'keyboard_arrow_right';
            }
        });
    }

    // --- Layer Link Navigation ---
    const layerLinks = document.querySelectorAll('.artboard-layer-link');
    layerLinks.forEach(link => {
        link.addEventListener('click', () => {
            const artboardId = link.getAttribute('data-artboard');
            if (!artboardId) return;

            updateSidebarActiveState(artboardId);
            const wrapperId = 'wrapper-' + artboardId;
            navigateTo(wrapperId);
        });
    });

    function updateSidebarActiveState(artboardId) {
        layerLinks.forEach(l => {
            if (l.getAttribute('data-artboard') === artboardId) {
                l.classList.add('active');
            } else {
                l.classList.remove('active');
            }
        });
    }

    // --- Project Card & Hero Button Navigation ---
    const viewProjectsBtn = document.getElementById('viewProjectsBtn');
    if (viewProjectsBtn) {
        viewProjectsBtn.addEventListener('click', enterProjectsSlideshow);
    }

    document.querySelectorAll('.project-card').forEach(card => {
        card.addEventListener('click', () => {
            const projectId = card.getAttribute('data-project');
            if (projectId) {
                const artboardId = 'project-' + projectId;
                updateSidebarActiveState(artboardId);
                navigateTo('wrapper-' + artboardId);
            }
        });
    });

    // --- Tooltip & Interactive Animations ---
    const tooltips = document.querySelectorAll('.tooltip-container');
    const highFiveBtn = document.getElementById('highFiveBtn');
    const highFiveOverlay = document.getElementById('highFiveAnimation');
    const logoContainer = document.getElementById('logoContainer');
    const avatarsContainer = document.getElementById('avatarsContainer');

    // Handle mobile tooltips (tap to show, tap elsewhere to hide)
    document.addEventListener('click', (e) => {
        // If clicking on logoContainer directly, toggle it
        if (logoContainer && logoContainer.contains(e.target)) {
            logoContainer.classList.toggle('tooltip-mobile-visible');
        } else if (avatarsContainer && avatarsContainer.contains(e.target)) {
            avatarsContainer.classList.toggle('tooltip-mobile-visible');
        } else {
            // Hide all tooltips if clicking outside
            tooltips.forEach(t => {
                if (t !== highFiveBtn && t !== logoContainer && t !== avatarsContainer) {
                    t.classList.remove('tooltip-mobile-visible');
                }
            });
            if (logoContainer && !logoContainer.contains(e.target)) {
                logoContainer.classList.remove('tooltip-mobile-visible');
            }
            if (avatarsContainer && !avatarsContainer.contains(e.target)) {
                avatarsContainer.classList.remove('tooltip-mobile-visible');
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
            if (!logoContainer.contains(e.target) && (!avatarsContainer || !avatarsContainer.contains(e.target))) {
                highFiveBtn.classList.add('tooltip-mobile-visible');
                logoContainer.classList.remove('tooltip-mobile-visible');
                if (avatarsContainer) avatarsContainer.classList.remove('tooltip-mobile-visible');
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

    function getArtboardLocalCoords(e) {
        if (!artboard) return { x: 0, y: 0 };
        const rect = artboard.getBoundingClientRect();
        return {
            x: (e.clientX - rect.left) / canvasZoom,
            y: (e.clientY - rect.top) / canvasZoom
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

        // Handle AJAX form submission for a seamless UX
        if (contactForm) {
            contactForm.addEventListener('submit', async (e) => {
                e.preventDefault();

                const submitContactBtn = document.getElementById('submitContactBtn');
                const formStatusMsg = document.getElementById('formStatusMsg');

                // Form data preparation
                const formData = new FormData(contactForm);

                // UI Loading state
                submitContactBtn.disabled = true;
                submitContactBtn.innerHTML = '<span class="material-symbols-outlined" style="animation: spin 1s linear infinite;">autorenew</span> Envoi...';

                if (!document.getElementById('spinnerStyle')) {
                    const style = document.createElement('style');
                    style.id = 'spinnerStyle';
                    style.innerHTML = `@keyframes spin { 100% { transform: rotate(360deg); } }`;
                    document.head.appendChild(style);
                }

                formStatusMsg.classList.add('hidden');

                try {
                    // Using Web3Forms AJAX endpoint
                    const response = await fetch('https://api.web3forms.com/submit', {
                        method: 'POST',
                        body: formData,
                        headers: {
                            'Accept': 'application/json'
                        }
                    });

                    if (response.ok) {
                        formStatusMsg.textContent = "Message envoyé avec succès !";
                        formStatusMsg.className = "form-status-msg success";
                        contactForm.reset();

                        setTimeout(() => {
                            contactModal.classList.add('hidden');
                            formStatusMsg.classList.add('hidden');
                        }, 3000);
                    } else {
                        throw new Error("Erreur serveur Web3Forms");
                    }
                } catch (error) {
                    console.error("Erreur d'envoi:", error);
                    formStatusMsg.innerHTML = "Oups ! Un problème est survenu lors de l'envoi.";
                    formStatusMsg.className = "form-status-msg error";
                } finally {
                    formStatusMsg.classList.remove('hidden');
                    submitContactBtn.disabled = false;
                    submitContactBtn.innerHTML = '<span class="material-symbols-outlined">send</span> Envoyer';
                }
            });
        }
    }

    // --- Slideshows ---
    function initSlideshows(container) {
        const root = container || document;
        root.querySelectorAll('.project-slideshow').forEach(slideshow => {
            const slides = slideshow.querySelectorAll('.slideshow-slide');
            const counter = slideshow.querySelector('.slideshow-counter');
            const prevBtn = slideshow.querySelector('.slideshow-prev');
            const nextBtn = slideshow.querySelector('.slideshow-next');
            if (!slides.length) return;

            let current = 0;
            slides.forEach((slide, i) => { if (slide.classList.contains('active')) current = i; });
            if (!slides[current].classList.contains('active')) slides[current].classList.add('active');
            if (counter) counter.textContent = `${current + 1} / ${slides.length}`;

            function show(index) {
                slides[current].classList.remove('active');
                current = (index + slides.length) % slides.length;
                slides[current].classList.add('active');
                if (counter) counter.textContent = `${current + 1} / ${slides.length}`;
            }

            if (prevBtn) prevBtn.addEventListener('click', (e) => { e.stopPropagation(); show(current - 1); });
            if (nextBtn) nextBtn.addEventListener('click', (e) => { e.stopPropagation(); show(current + 1); });
        });
    }

    initSlideshows();

});
