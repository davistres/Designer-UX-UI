document.addEventListener('DOMContentLoaded', () => {
    
    const presentBtn = document.getElementById('presentBtn');
    const exitPresentBtn = document.getElementById('exitPresentBtn');
    const artboard = document.getElementById('portfolio-artboard');

    // --- Presentation Mode Logic ---
    
    function enterPresentationMode() {
        document.body.classList.add('mode-present');
        exitPresentBtn.classList.remove('hidden');
        
        // Force mockup state
        artboard.setAttribute('data-state', 'mockup');
    }

    function exitPresentationMode() {
        document.body.classList.remove('mode-present');
        exitPresentBtn.classList.add('hidden');
        
        // Return to wireframe state
        artboard.setAttribute('data-state', 'wireframe');
        
        // Reset scroll position of artboard wrapper
        window.scrollTo(0,0);
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
        }
    });

    artboard.addEventListener('mouseleave', () => {
        if (!document.body.classList.contains('mode-present')) {
             artboard.setAttribute('data-state', 'wireframe');
        }
    });

});
