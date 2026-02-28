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

    // --- Presentation Mode Logic ---

    function enterPresentationMode() {
        document.body.classList.add('mode-present');
        exitPresentBtn.classList.remove('hidden');

        // Force mockup state
        artboard.setAttribute('data-state', 'mockup');
        updateLogo('mockup');
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

});
