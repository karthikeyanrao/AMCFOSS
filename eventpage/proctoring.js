// Proctoring System
let isFullscreen = false;
let warningTimer = null;
let isEliminated = false;
let altPressed = false;
let qPressed = false;

// Disable keyboard input (except specific keys)
document.addEventListener('keydown', function (e) {
    // Check if welcome screen is visible - allow all keyboard input
    const welcomeScreen = document.getElementById('welcomeScreen');
    if (welcomeScreen && !welcomeScreen.classList.contains('hidden')) {
        // Allow all keyboard input on welcome screen
        return;
    }

    // Allow Alt+Q for exit
    if (e.key === 'Alt') {
        altPressed = true;
    }
    if (e.key === 'q' || e.key === 'Q') {
        qPressed = true;
    }

    // Check for Alt+Q combination
    if (altPressed && qPressed) {
        if (confirm('Are you sure you want to exit the exam?')) {
            exitFullscreen();
            window.location.href = 'about:blank';
        }
        altPressed = false;
        qPressed = false;
        return;
    }

    // Allow F12 for fullscreen restoration
    if (e.key === 'F12') {
        e.preventDefault();
        if (!isFullscreen && warningTimer) {
            enterFullscreen();
            clearWarning();
        }
        return;
    }

    // Allow ESC to trigger warning
    if (e.key === 'Escape') {
        // ESC is handled by fullscreen change event
        return;
    }

    // Block all other keyboard inputs
    e.preventDefault();
    return false;
});

document.addEventListener('keyup', function (e) {
    if (e.key === 'Alt') {
        altPressed = false;
    }
    if (e.key === 'q' || e.key === 'Q') {
        qPressed = false;
    }
});

// Disable right-click (only during exam)
document.addEventListener('contextmenu', function (e) {
    const welcomeScreen = document.getElementById('welcomeScreen');
    if (welcomeScreen && !welcomeScreen.classList.contains('hidden')) {
        return; // Allow right-click on welcome screen
    }
    e.preventDefault();
    return false;
});

// Disable copy/paste (only during exam)
document.addEventListener('copy', function (e) {
    const welcomeScreen = document.getElementById('welcomeScreen');
    if (welcomeScreen && !welcomeScreen.classList.contains('hidden')) {
        return; // Allow copy on welcome screen
    }
    e.preventDefault();
    return false;
});

document.addEventListener('paste', function (e) {
    const welcomeScreen = document.getElementById('welcomeScreen');
    if (welcomeScreen && !welcomeScreen.classList.contains('hidden')) {
        return; // Allow paste on welcome screen
    }
    e.preventDefault();
    return false;
});

document.addEventListener('cut', function (e) {
    const welcomeScreen = document.getElementById('welcomeScreen');
    if (welcomeScreen && !welcomeScreen.classList.contains('hidden')) {
        return; // Allow cut on welcome screen
    }
    e.preventDefault();
    return false;
});

// Disable Ctrl+C, Ctrl+V, Ctrl+X
document.addEventListener('keydown', function (e) {
    if (e.ctrlKey && (e.key === 'c' || e.key === 'C' ||
        e.key === 'v' || e.key === 'V' ||
        e.key === 'x' || e.key === 'X')) {
        e.preventDefault();
        return false;
    }
});

// Fullscreen Management
function enterFullscreen() {
    const elem = document.documentElement;

    if (elem.requestFullscreen) {
        return elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) {
        return elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
        return elem.msRequestFullscreen();
    }

    return Promise.reject(new Error('Fullscreen API not supported'));
}

function exitFullscreen() {
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
    }
}

// Monitor fullscreen changes
document.addEventListener('fullscreenchange', handleFullscreenChange);
document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
document.addEventListener('mozfullscreenchange', handleFullscreenChange);
document.addEventListener('MSFullscreenChange', handleFullscreenChange);

function handleFullscreenChange() {
    isFullscreen = !!(document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement);

    // Only trigger warning if exam has started and not eliminated
    const examScreen = document.getElementById('examScreen');
    if (!examScreen.classList.contains('hidden') && !isEliminated) {
        if (!isFullscreen) {
            showWarning();
        } else {
            clearWarning();
        }
    }
}

// Warning System
function showWarning() {
    if (isEliminated) return;

    const modal = document.getElementById('warningModal');
    modal.classList.add('active');

    let countdown = 5;
    const countdownElement = document.getElementById('countdown');
    countdownElement.textContent = countdown;

    warningTimer = setInterval(() => {
        countdown--;
        countdownElement.textContent = countdown;

        if (countdown <= 0) {
            clearInterval(warningTimer);
            eliminate('Failed to return to fullscreen mode within 5 seconds');
        }
    }, 1000);
}

function clearWarning() {
    const modal = document.getElementById('warningModal');
    modal.classList.remove('active');

    if (warningTimer) {
        clearInterval(warningTimer);
        warningTimer = null;
    }
}

// Elimination System
function eliminate(reason) {
    isEliminated = true;

    // Clear any timers
    if (warningTimer) {
        clearInterval(warningTimer);
    }
    if (window.examTimerInterval) {
        clearInterval(window.examTimerInterval);
    }

    // Show elimination screen
    const eliminationScreen = document.getElementById('eliminationScreen');
    const eliminationReason = document.getElementById('eliminationReason');

    eliminationReason.textContent = reason;
    eliminationScreen.classList.remove('hidden');

    // Exit fullscreen
    exitFullscreen();

    // Log the violation (you can send this to a server)
    console.error('EXAM VIOLATION:', {
        timestamp: new Date().toISOString(),
        reason: reason,
        candidateName: document.getElementById('displayName')?.textContent,
        candidateId: document.getElementById('displayId')?.textContent
    });
}

// Prevent tab switching
document.addEventListener('visibilitychange', function () {
    if (document.hidden && !isEliminated) {
        const examScreen = document.getElementById('examScreen');
        if (!examScreen.classList.contains('hidden')) {
            eliminate('Switched to another tab or window');
        }
    }
});

// Prevent window blur (losing focus)
window.addEventListener('blur', function () {
    if (!isEliminated) {
        const examScreen = document.getElementById('examScreen');
        if (!examScreen.classList.contains('hidden')) {
            // Give a small delay to avoid false positives
            setTimeout(() => {
                if (document.hasFocus() === false && !isEliminated) {
                    eliminate('Lost window focus - possible tab switching');
                }
            }, 100);
        }
    }
});

// Prevent developer tools
document.addEventListener('keydown', function (e) {
    // F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
    if (e.key === 'F12' && !warningTimer) {
        // F12 is allowed only during warning
        e.preventDefault();
    }
    if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) {
        e.preventDefault();
        eliminate('Attempted to open developer tools');
    }
    if (e.ctrlKey && e.key === 'u') {
        e.preventDefault();
        eliminate('Attempted to view page source');
    }
});

// Detect if DevTools is open
let devtoolsOpen = false;
const detectDevTools = () => {
    const threshold = 160;
    if (window.outerWidth - window.innerWidth > threshold ||
        window.outerHeight - window.innerHeight > threshold) {
        if (!devtoolsOpen && !isEliminated) {
            devtoolsOpen = true;
            eliminate('Developer tools detected');
        }
    }
};

setInterval(detectDevTools, 1000);

// Prevent printing
window.addEventListener('beforeprint', function (e) {
    e.preventDefault();
    eliminate('Attempted to print the exam');
    return false;
});

// Prevent screenshots (limited effectiveness)
document.addEventListener('keyup', function (e) {
    // PrintScreen key
    if (e.key === 'PrintScreen') {
        eliminate('Screenshot attempt detected');
    }
});

console.log('Proctoring system initialized');
