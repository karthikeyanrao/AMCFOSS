// ============================================
// EXAM CONFIGURATION FILE
// ============================================
// Modify this file to customize your exam settings

const CONFIG = {
    // Exam Details
    examTitle: "Proctored MCQ Examination - Phase 1",
    eventName: "Preliminary Round",
    organizationName: "Your Organization Name",

    // Timing
    examDuration: 30,           // Duration in minutes
    warningTimeout: 5,          // Seconds before elimination when exiting fullscreen

    // Scoring
    totalQuestions: 10,
    passingPercentage: 40,
    negativeMarking: false,     // Enable/disable negative marking
    negativeMarks: 0.25,        // Marks to deduct for wrong answer (if enabled)

    // Security Settings
    allowKeyboard: false,       // Allow keyboard input (NOT RECOMMENDED)
    allowCopyPaste: false,      // Allow copy/paste (NOT RECOMMENDED)
    allowRightClick: false,     // Allow right-click (NOT RECOMMENDED)
    detectTabSwitch: true,      // Eliminate on tab switch
    detectDevTools: true,       // Eliminate if dev tools opened
    requireFullscreen: true,    // Require fullscreen mode

    // Features
    showQuestionPalette: true,  // Show question navigation palette
    allowQuestionSkip: true,    // Allow skipping questions
    showTimer: true,            // Show countdown timer
    showProgress: true,         // Show progress indicator

    // UI Customization
    theme: {
        primaryColor: "#6366f1",
        secondaryColor: "#8b5cf6",
        successColor: "#10b981",
        warningColor: "#f59e0b",
        dangerColor: "#ef4444"
    },

    // Backend Integration (for Phase 2)
    backend: {
        enabled: false,
        apiUrl: "https://your-api-url.com/api",
        endpoints: {
            startExam: "/exam/start",
            submitExam: "/exam/submit",
            logViolation: "/exam/violation"
        }
    },

    // Email Notifications (for Phase 2)
    notifications: {
        enabled: false,
        sendResultsEmail: false,
        adminEmail: "admin@example.com"
    }
};

// Export configuration
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
