// Exam Configuration
const EXAM_CONFIG = {
    duration: 1, // minutes
    totalQuestions: 10,
    passingPercentage: 40
};

// Sample Questions (Replace with your actual questions)
const questions = [
    {
        id: 1,
        question: "What is the capital of France?",
        options: ["London", "Berlin", "Paris", "Madrid"],
        correctAnswer: 2
    },
    {
        id: 2,
        question: "Which programming language is known as the 'language of the web'?",
        options: ["Python", "JavaScript", "Java", "C++"],
        correctAnswer: 1
    },
    {
        id: 3,
        question: "What does HTML stand for?",
        options: [
            "Hyper Text Markup Language",
            "High Tech Modern Language",
            "Home Tool Markup Language",
            "Hyperlinks and Text Markup Language"
        ],
        correctAnswer: 0
    },
    {
        id: 4,
        question: "Which of the following is NOT a JavaScript framework?",
        options: ["React", "Angular", "Django", "Vue"],
        correctAnswer: 2
    },
    {
        id: 5,
        question: "What is the time complexity of binary search?",
        options: ["O(n)", "O(log n)", "O(n²)", "O(1)"],
        correctAnswer: 1
    },
    {
        id: 6,
        question: "Which CSS property is used to change the text color?",
        options: ["text-color", "font-color", "color", "text-style"],
        correctAnswer: 2
    },
    {
        id: 7,
        question: "What does SQL stand for?",
        options: [
            "Structured Query Language",
            "Simple Question Language",
            "Structured Question Language",
            "Simple Query Language"
        ],
        correctAnswer: 0
    },
    {
        id: 8,
        question: "Which HTTP method is used to send data to a server?",
        options: ["GET", "POST", "PUT", "DELETE"],
        correctAnswer: 1
    },
    {
        id: 9,
        question: "What is the main purpose of Git?",
        options: [
            "Database management",
            "Version control",
            "Web hosting",
            "Code compilation"
        ],
        correctAnswer: 1
    },
    {
        id: 10,
        question: "Which of the following is a NoSQL database?",
        options: ["MySQL", "PostgreSQL", "MongoDB", "Oracle"],
        correctAnswer: 2
    }
];

// Exam State
let currentQuestionIndex = 0;
let answers = new Array(questions.length).fill(null);
let examStartTime = null;
let examTimerInterval = null;
let candidateInfo = {
    name: '',
    id: ''
};

// Start Exam
function startExam() {
    const name = document.getElementById('candidateName').value.trim();
    const id = document.getElementById('candidateId').value.trim();

    if (!name || !id) {
        alert('Please enter your name and ID');
        return;
    }

    candidateInfo.name = name;
    candidateInfo.id = id;

    // Hide welcome screen first
    document.getElementById('welcomeScreen').classList.add('hidden');

    // Show exam screen immediately
    document.getElementById('examScreen').classList.remove('hidden');

    // Set candidate details
    document.getElementById('displayName').textContent = name;
    document.getElementById('displayId').textContent = id;

    // Initialize exam
    examStartTime = Date.now();
    startTimer();
    renderQuestion();
    renderPalette();
    updateNavigationButtons();

    // Enter fullscreen - must be called directly from user action
    enterFullscreen().then(() => {
        console.log('Fullscreen activated successfully');
    }).catch((error) => {
        console.warn('Fullscreen failed:', error);
        alert('⚠️ Please press F11 to enter fullscreen mode manually, or allow fullscreen when prompted.');
    });

    console.log('Exam started for:', name, id);
}

// Timer
function startTimer() {
    let timeLeft = EXAM_CONFIG.duration * 60; // Convert to seconds

    updateTimerDisplay(timeLeft);

    examTimerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay(timeLeft);

        if (timeLeft <= 0) {
            clearInterval(examTimerInterval);
            autoSubmitExam();
        }
    }, 1000);

    // Make it globally accessible for proctoring
    window.examTimerInterval = examTimerInterval;
}

function updateTimerDisplay(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const display = `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    document.getElementById('examTimer').textContent = display;

    // Change color when time is running out
    const timerElement = document.querySelector('.timer-display');
    if (seconds <= 60) {
        timerElement.style.color = '#ef4444';
    } else if (seconds <= 300) {
        timerElement.style.color = '#f59e0b';
    }
}

// Render Question
function renderQuestion() {
    const question = questions[currentQuestionIndex];

    document.getElementById('questionText').textContent =
        `${currentQuestionIndex + 1}. ${question.question}`;

    const optionsContainer = document.getElementById('optionsContainer');
    optionsContainer.innerHTML = '';

    question.options.forEach((option, index) => {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'option';
        if (answers[currentQuestionIndex] === index) {
            optionDiv.classList.add('selected');
        }

        optionDiv.innerHTML = `
            <div class="option-label">${String.fromCharCode(65 + index)}</div>
            <div class="option-text">${option}</div>
        `;

        optionDiv.addEventListener('click', () => selectOption(index));
        optionsContainer.appendChild(optionDiv);
    });

    // Update question counter
    document.getElementById('currentQuestion').textContent = currentQuestionIndex + 1;
    document.getElementById('totalQuestions').textContent = questions.length;
}

// Select Option
function selectOption(optionIndex) {
    answers[currentQuestionIndex] = optionIndex;
    renderQuestion();
    renderPalette();
}

// Navigation
function nextQuestion() {
    if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        renderQuestion();
        renderPalette();
        updateNavigationButtons();
    }
}

function previousQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        renderQuestion();
        renderPalette();
        updateNavigationButtons();
    }
}

function goToQuestion(index) {
    currentQuestionIndex = index;
    renderQuestion();
    renderPalette();
    updateNavigationButtons();
}

function updateNavigationButtons() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');

    prevBtn.disabled = currentQuestionIndex === 0;
    prevBtn.style.opacity = currentQuestionIndex === 0 ? '0.5' : '1';

    if (currentQuestionIndex === questions.length - 1) {
        nextBtn.classList.add('hidden');
        submitBtn.classList.remove('hidden');
    } else {
        nextBtn.classList.remove('hidden');
        submitBtn.classList.add('hidden');
    }
}

// Question Palette
function renderPalette() {
    const palette = document.getElementById('palette');
    palette.innerHTML = '';

    questions.forEach((q, index) => {
        const paletteItem = document.createElement('div');
        paletteItem.className = 'palette-item';
        paletteItem.textContent = index + 1;

        if (answers[index] !== null) {
            paletteItem.classList.add('answered');
        }

        if (index === currentQuestionIndex) {
            paletteItem.classList.add('current');
        }

        paletteItem.addEventListener('click', () => goToQuestion(index));
        palette.appendChild(paletteItem);
    });
}

// Submit Exam
function submitExam() {
    const unanswered = answers.filter(a => a === null).length;

    if (unanswered > 0) {
        const confirmSubmit = confirm(
            `You have ${unanswered} unanswered question(s). Do you want to submit anyway?`
        );
        if (!confirmSubmit) return;
    }

    finishExam();
}

function autoSubmitExam() {
    alert('Time is up! Your exam will be submitted automatically.');
    finishExam();
}

function finishExam() {
    // Stop timer
    if (examTimerInterval) {
        clearInterval(examTimerInterval);
    }

    // Calculate score
    let correctAnswers = 0;
    questions.forEach((q, index) => {
        if (answers[index] === q.correctAnswer) {
            correctAnswers++;
        }
    });

    const percentage = (correctAnswers / questions.length) * 100;

    // Hide exam screen
    document.getElementById('examScreen').classList.add('hidden');

    // Exit fullscreen
    exitFullscreen();

    // Show results
    showResults(correctAnswers, percentage);

    // Log results
    console.log('Exam completed:', {
        name: candidateInfo.name,
        id: candidateInfo.id,
        score: correctAnswers,
        total: questions.length,
        percentage: percentage.toFixed(2),
        answers: answers,
        timestamp: new Date().toISOString()
    });
}

function showResults(score, percentage) {
    const resultsScreen = document.getElementById('resultsScreen');

    document.getElementById('resultName').textContent = candidateInfo.name;
    document.getElementById('resultId').textContent = candidateInfo.id;
    document.getElementById('resultScore').textContent =
        `${score} / ${questions.length}`;
    document.getElementById('resultPercentage').textContent =
        `${percentage.toFixed(2)}%`;

    resultsScreen.classList.remove('hidden');
    resultsScreen.classList.add('active');
}

// Initialize
console.log('Exam system initialized');
console.log(`Total questions: ${questions.length}`);
console.log(`Duration: ${EXAM_CONFIG.duration} minutes`);
