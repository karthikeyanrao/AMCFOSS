// ============================================
// QUESTIONS TEMPLATE
// ============================================
// Use this template to add your exam questions
// Copy the template and fill in your questions

/*
QUESTION TEMPLATE:
{
    id: 1,                                    // Unique question ID
    question: "Your question text here?",    // The question
    options: [                                // Array of 4 options
        "Option A",
        "Option B", 
        "Option C",
        "Option D"
    ],
    correctAnswer: 0,                         // Index of correct answer (0-3)
    difficulty: "easy",                       // easy, medium, hard (optional)
    category: "General",                      // Category/subject (optional)
    marks: 1                                  // Marks for this question (optional)
}
*/

// ============================================
// SAMPLE QUESTIONS - REPLACE WITH YOUR OWN
// ============================================

const examQuestions = [
    // Question 1
    {
        id: 1,
        question: "What is the capital of France?",
        options: [
            "London",
            "Berlin",
            "Paris",
            "Madrid"
        ],
        correctAnswer: 2,
        difficulty: "easy",
        category: "Geography"
    },

    // Question 2
    {
        id: 2,
        question: "Which programming language is known as the 'language of the web'?",
        options: [
            "Python",
            "JavaScript",
            "Java",
            "C++"
        ],
        correctAnswer: 1,
        difficulty: "easy",
        category: "Programming"
    },

    // Question 3
    {
        id: 3,
        question: "What does HTML stand for?",
        options: [
            "Hyper Text Markup Language",
            "High Tech Modern Language",
            "Home Tool Markup Language",
            "Hyperlinks and Text Markup Language"
        ],
        correctAnswer: 0,
        difficulty: "easy",
        category: "Web Development"
    },

    // Question 4
    {
        id: 4,
        question: "Which of the following is NOT a JavaScript framework?",
        options: [
            "React",
            "Angular",
            "Django",
            "Vue"
        ],
        correctAnswer: 2,
        difficulty: "medium",
        category: "Programming"
    },

    // Question 5
    {
        id: 5,
        question: "What is the time complexity of binary search?",
        options: [
            "O(n)",
            "O(log n)",
            "O(n²)",
            "O(1)"
        ],
        correctAnswer: 1,
        difficulty: "medium",
        category: "Data Structures"
    },

    // Question 6
    {
        id: 6,
        question: "Which CSS property is used to change the text color?",
        options: [
            "text-color",
            "font-color",
            "color",
            "text-style"
        ],
        correctAnswer: 2,
        difficulty: "easy",
        category: "Web Development"
    },

    // Question 7
    {
        id: 7,
        question: "What does SQL stand for?",
        options: [
            "Structured Query Language",
            "Simple Question Language",
            "Structured Question Language",
            "Simple Query Language"
        ],
        correctAnswer: 0,
        difficulty: "easy",
        category: "Database"
    },

    // Question 8
    {
        id: 8,
        question: "Which HTTP method is used to send data to a server?",
        options: [
            "GET",
            "POST",
            "PUT",
            "DELETE"
        ],
        correctAnswer: 1,
        difficulty: "medium",
        category: "Web Development"
    },

    // Question 9
    {
        id: 9,
        question: "What is the main purpose of Git?",
        options: [
            "Database management",
            "Version control",
            "Web hosting",
            "Code compilation"
        ],
        correctAnswer: 1,
        difficulty: "easy",
        category: "Development Tools"
    },

    // Question 10
    {
        id: 10,
        question: "Which of the following is a NoSQL database?",
        options: [
            "MySQL",
            "PostgreSQL",
            "MongoDB",
            "Oracle"
        ],
        correctAnswer: 2,
        difficulty: "medium",
        category: "Database"
    }

    // ADD MORE QUESTIONS HERE
    // Copy the template above and add your questions
];

// ============================================
// QUESTION CATEGORIES (Optional)
// ============================================
const questionCategories = [
    "Programming",
    "Web Development",
    "Database",
    "Data Structures",
    "Algorithms",
    "Geography",
    "Development Tools",
    "General Knowledge"
];

// ============================================
// DIFFICULTY LEVELS (Optional)
// ============================================
const difficultyLevels = {
    easy: { marks: 1, color: "#10b981" },
    medium: { marks: 2, color: "#f59e0b" },
    hard: { marks: 3, color: "#ef4444" }
};

// Export questions
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { examQuestions, questionCategories, difficultyLevels };
}
