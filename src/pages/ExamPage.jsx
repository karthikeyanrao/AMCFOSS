import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import '../styles/ExamPage.css';

export default function ExamPage() {
    const navigate = useNavigate();
    const [examState, setExamState] = useState('welcome'); // welcome, exam, results, eliminated
    const [candidateName, setCandidateName] = useState('');
    const [candidateId, setCandidateId] = useState('');
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState(Array(10).fill(null));
    const [timeLeft, setTimeLeft] = useState(1 * 60); // 1 minute in seconds
    const [showWarning, setShowWarning] = useState(false);
    const [warningCountdown, setWarningCountdown] = useState(5);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isEliminated, setIsEliminated] = useState(false);
    const [eliminationReason, setEliminationReason] = useState('');
    const [score, setScore] = useState(0);
    const [showUnansweredModal, setShowUnansweredModal] = useState(false);
    const [unansweredCount, setUnansweredCount] = useState(0);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const timerRef = useRef(null);
    const warningTimerRef = useRef(null);

    // Sample questions
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

    // Fullscreen management
    const enterFullscreen = async () => {
        try {
            const elem = document.documentElement;
            if (elem.requestFullscreen) {
                await elem.requestFullscreen();
            } else if (elem.webkitRequestFullscreen) {
                await elem.webkitRequestFullscreen();
            } else if (elem.msRequestFullscreen) {
                await elem.msRequestFullscreen();
            }
            setIsFullscreen(true);
        } catch (error) {
            console.error('Fullscreen error:', error);
            alert('⚠️ Please press F11 to enter fullscreen mode manually.');
        }
    };

    const exitFullscreen = () => {
        try {
            if (document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement) {
                if (document.exitFullscreen) {
                    document.exitFullscreen().catch(err => console.log('Exit fullscreen error:', err));
                } else if (document.webkitExitFullscreen) {
                    document.webkitExitFullscreen();
                } else if (document.msExitFullscreen) {
                    document.msExitFullscreen();
                }
            }
            setIsFullscreen(false);
        } catch (error) {
            console.log('Exit fullscreen error:', error);
            setIsFullscreen(false);
        }
    };

    // Handle fullscreen changes
    useEffect(() => {
        const handleFullscreenChange = () => {
            const inFullscreen = !!(
                document.fullscreenElement ||
                document.webkitFullscreenElement ||
                document.mozFullScreenElement ||
                document.msFullscreenElement
            );

            setIsFullscreen(inFullscreen);

            if (!inFullscreen && examState === 'exam' && !isEliminated) {
                setShowWarning(true);
                setWarningCountdown(5);
            }
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.addEventListener('mozfullscreenchange', handleFullscreenChange);
        document.addEventListener('MSFullscreenChange', handleFullscreenChange);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
            document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
            document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
        };
    }, [examState, isEliminated]);

    // Warning countdown
    useEffect(() => {
        if (showWarning && warningCountdown > 0) {
            warningTimerRef.current = setTimeout(() => {
                setWarningCountdown(prev => prev - 1);
            }, 1000);
        } else if (showWarning && warningCountdown === 0) {
            eliminate('Failed to return to fullscreen mode within 5 seconds');
        }

        return () => {
            if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
        };
    }, [showWarning, warningCountdown]);

    // Exam timer
    useEffect(() => {
        if (examState === 'exam' && timeLeft > 0) {
            timerRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        handleSubmit(true);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [examState, timeLeft]);

    // Keyboard blocking during exam
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (examState !== 'exam') return;

            // Allow Alt+Q to exit
            if (e.altKey && (e.key === 'q' || e.key === 'Q')) {
                if (window.confirm('Are you sure you want to exit the exam?')) {
                    exitFullscreen();
                    navigate('/events');
                }
                return;
            }

            // Allow F12 during warning
            if (e.key === 'F12' && showWarning) {
                e.preventDefault();
                enterFullscreen();
                setShowWarning(false);
                return;
            }

            // Block all other keys
            e.preventDefault();
            return false;
        };

        const handleContextMenu = (e) => {
            if (examState === 'exam') {
                e.preventDefault();
                return false;
            }
        };

        const handleCopy = (e) => {
            if (examState === 'exam') {
                e.preventDefault();
                return false;
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('copy', handleCopy);
        document.addEventListener('paste', handleCopy);
        document.addEventListener('cut', handleCopy);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('copy', handleCopy);
            document.removeEventListener('paste', handleCopy);
            document.removeEventListener('cut', handleCopy);
        };
    }, [examState, showWarning, navigate]);

    const eliminate = (reason) => {
        setIsEliminated(true);
        setEliminationReason(reason);
        setExamState('eliminated');
        exitFullscreen();
        if (timerRef.current) clearInterval(timerRef.current);
    };

    const startExam = () => {
        if (!candidateName.trim() || !candidateId.trim()) {
            alert('Please enter your name and ID');
            return;
        }

        setExamState('exam');
        enterFullscreen();
    };

    const selectOption = (optionIndex) => {
        const newAnswers = [...answers];
        newAnswers[currentQuestion] = optionIndex;
        setAnswers(newAnswers);
    };

    const handleSubmit = async (autoSubmit = false) => {
        const unanswered = answers.filter(a => a === null).length;

        // Show modal for unanswered questions (not for auto-submit)
        if (!autoSubmit && unanswered > 0) {
            setUnansweredCount(unanswered);
            setShowUnansweredModal(true);
            return;
        }

        // Proceed with submission
        await submitExam();
    };

    const submitExam = async () => {
        // Calculate score
        let correctCount = 0;
        questions.forEach((q, index) => {
            if (answers[index] === q.correctAnswer) {
                correctCount++;
            }
        });

        // Stop timer
        if (timerRef.current) clearInterval(timerRef.current);

        try {
            // Save to Firestore WOC collection
            await addDoc(collection(db, 'WOC'), {
                name: candidateName,
                rollNo: candidateId,
                score: correctCount,
                percentage: ((correctCount / questions.length) * 100).toFixed(2),
                completedAt: serverTimestamp(),
                timeSpent: (1 * 60) - timeLeft, // seconds spent
            });

            // Show success modal
            setShowSuccessModal(true);

            // Redirect after 3 seconds
            setTimeout(() => {
                exitFullscreen();
                navigate('/events');
            }, 3000);
        } catch (error) {
            console.error('Error saving exam results:', error);
            // Even on error, redirect
            setTimeout(() => {
                exitFullscreen();
                navigate('/events');
            }, 2000);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    // Welcome Screen
    if (examState === 'welcome') {
        return (
            <div className="exam-page">
                <div className="welcome-screen">
                    <div className="welcome-content">
                        <h1>🎯 Proctored MCQ Examination</h1>
                        <h2>Phase 1 - Preliminary Round</h2>

                        <div className="instructions">
                            <h3>📋 Exam Rules & Instructions:</h3>
                            <ul>
                                <li>✓ The exam will run in <strong>FULLSCREEN MODE</strong> only</li>
                                <li>✓ <strong>Mouse navigation ONLY</strong> - Keyboard is disabled</li>
                                <li>✓ Copy/Paste is <strong>DISABLED</strong></li>
                                <li>✓ Right-click is <strong>DISABLED</strong></li>
                                <li>✓ Press <strong>Alt+Q</strong> to exit the exam</li>
                                <li>✓ If you exit fullscreen, you have <strong>5 seconds</strong> to press F12</li>
                                <li>⚠️ Violation of any rule will result in <strong>ELIMINATION</strong></li>
                            </ul>
                        </div>

                        <div className="candidate-info">
                            <input
                                type="text"
                                placeholder="Enter Your Name"
                                value={candidateName}
                                onChange={(e) => setCandidateName(e.target.value)}
                            />
                            <input
                                type="text"
                                placeholder="Enter Your ID/Roll Number"
                                value={candidateId}
                                onChange={(e) => setCandidateId(e.target.value)}
                            />
                        </div>

                        <button className="start-btn" onClick={startExam}>
                            Start Exam
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Eliminated Screen
    if (examState === 'eliminated') {
        return (
            <div className="exam-page">
                <div className="elimination-screen">
                    <div className="elimination-content">
                        <h1>❌ ELIMINATED</h1>
                        <p>You have violated exam protocols.</p>
                        <p className="reason">{eliminationReason}</p>
                        <p className="contact">Please contact the exam administrator.</p>
                        <button className="restart-btn" onClick={() => navigate('/events')}>
                            Return to Events
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Exam Screen (results screen removed - data saved to Firestore)
    const currentQ = questions[currentQuestion];

    return (
        <div className="exam-page">
            {/* Warning Modal */}
            {showWarning && (
                <div className="modal active">
                    <div className="modal-content">
                        <h2>⚠️ Fullscreen Required</h2>
                        <p>You must remain in fullscreen mode during the exam.</p>
                        <p className="timer">Press F12 to return to fullscreen: <span>{warningCountdown}</span>s</p>
                        <div className="warning-note">Failure to comply will result in elimination!</div>
                    </div>
                </div>
            )}

            {/* Unanswered Questions Modal */}
            {showUnansweredModal && (
                <div className="modal active">
                    <div className="modal-content">
                        <h2>⚠️ Unanswered Questions</h2>
                        <p>You have <strong>{unansweredCount}</strong> unanswered question(s).</p>
                        <p>Do you want to submit anyway?</p>
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                            <button
                                className="nav-btn"
                                onClick={() => setShowUnansweredModal(false)}
                                style={{ flex: 1 }}
                            >
                                Go Back
                            </button>
                            <button
                                className="submit-btn"
                                onClick={() => {
                                    setShowUnansweredModal(false);
                                    submitExam();
                                }}
                                style={{ flex: 1 }}
                            >
                                Submit Anyway
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Modal */}
            {showSuccessModal && (
                <div className="modal active">
                    <div className="modal-content" style={{ background: 'linear-gradient(135deg, rgba(46, 204, 113, 0.2), rgba(39, 174, 96, 0.2))' }}>
                        <h2 style={{ color: '#2ecc71' }}>✅ Submitted Successfully!</h2>
                        <p>Your exam has been submitted.</p>
                        <p>We'll get back to you soon.</p>
                        <div style={{ marginTop: '1rem', fontSize: '0.9em', opacity: 0.8 }}>
                            Redirecting to events page...
                        </div>
                    </div>
                </div>
            )}


            <div className="exam-screen">
                <div className="exam-header">
                    <div className="candidate-details">
                        {candidateName} | {candidateId}
                    </div>
                    <div className="timer-display" style={{ color: timeLeft <= 60 ? '#ef4444' : timeLeft <= 300 ? '#f59e0b' : '#f59e0b' }}>
                        Time Remaining: {formatTime(timeLeft)}
                    </div>
                    <div className="question-counter">
                        Question {currentQuestion + 1} of {questions.length}
                    </div>
                </div>

                <div className="exam-container">
                    {/* Question Palette */}
                    <div className="question-palette">
                        <h4>Question Palette</h4>
                        <div className="palette-grid">
                            {questions.map((_, index) => (
                                <div
                                    key={index}
                                    className={`palette-item ${answers[index] !== null ? 'answered' : ''} ${index === currentQuestion ? 'current' : ''}`}
                                    onClick={() => setCurrentQuestion(index)}
                                >
                                    {index + 1}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Question Section */}
                    <div className="question-section">
                        <h3 className="question-text">
                            {currentQuestion + 1}. {currentQ.question}
                        </h3>
                        <div className="options-container">
                            {currentQ.options.map((option, index) => (
                                <div
                                    key={index}
                                    className={`option ${answers[currentQuestion] === index ? 'selected' : ''}`}
                                    onClick={() => selectOption(index)}
                                >
                                    <div className="option-label">{String.fromCharCode(65 + index)}</div>
                                    <div className="option-text">{option}</div>
                                </div>
                            ))}
                        </div>

                        <div className="navigation-buttons">
                            <button
                                className="nav-btn"
                                onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                                disabled={currentQuestion === 0}
                                style={{ opacity: currentQuestion === 0 ? 0.5 : 1 }}
                            >
                                ← Previous
                            </button>
                            {currentQuestion === questions.length - 1 ? (
                                <button className="submit-btn" onClick={() => handleSubmit(false)}>
                                    Submit Exam
                                </button>
                            ) : (
                                <button
                                    className="nav-btn"
                                    onClick={() => setCurrentQuestion(prev => Math.min(questions.length - 1, prev + 1))}
                                >
                                    Next →
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="exit-hint">Press Alt+Q to exit exam</div>
            </div>
        </div>
    );
}
