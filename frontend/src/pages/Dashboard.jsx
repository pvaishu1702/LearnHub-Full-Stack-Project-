
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_BASE =
  "http://localhost:8080/OnlineLearningBackend/api";

const ENROLLMENTS_API = `${API_BASE}/enrollments`;
const PROGRESS_API = `${API_BASE}/progress`;
const QUIZ_RESULTS_API = `${API_BASE}/quiz-results`;

const lessonData = {
  1: [
    {
      lessonId: 1,
      title: "Introduction to Java",
      content:
        "Java is a high-level, object-oriented programming language. It is platform-independent because Java programs run on the Java Virtual Machine (JVM).",
      points: [
        "Java is simple and object-oriented.",
        "JDK is used to develop Java applications.",
        "JVM executes Java bytecode."
      ]
    },
    {
      lessonId: 5,
      title: "Java Methods and Arrays",
      content:
        "Methods organize reusable blocks of code. Arrays store multiple values of the same type in a single variable.",
      points: [
        "Methods help reuse code.",
        "A method can accept parameters and return a value.",
        "Arrays store multiple values of the same data type.",
        "Array indexes start at zero."
      ]
    },
    {
      lessonId: 2,
      title: "Object-Oriented Programming",
      content:
        "Object-oriented programming organizes programs using classes and objects.",
      points: [
        "Encapsulation protects data.",
        "Inheritance supports code reuse.",
        "Polymorphism allows different behaviors.",
        "Abstraction hides implementation details."
      ]
    }
  ],

  2: [
    {
      lessonId: 3,
      title: "Introduction to HTML",
      content:
        "HTML stands for HyperText Markup Language. It defines the structure and content of web pages.",
      points: [
        "HTML uses tags and elements.",
        "Headings use h1 to h6 tags.",
        "Links use the anchor tag.",
        "Forms collect user input."
      ]
    },
    {
      lessonId: 6,
      title: "CSS Styling",
      content:
        "CSS stands for Cascading Style Sheets. It controls the appearance and layout of web pages.",
      points: [
        "CSS changes colors and fonts.",
        "The box model contains margin, border, padding and content.",
        "Flexbox helps arrange elements."
      ]
    },
    {
      lessonId: 7,
      title: "JavaScript Basics",
      content:
        "JavaScript adds interactivity to web pages and allows websites to respond to user actions.",
      points: [
        "Variables store values.",
        "Functions organize reusable code.",
        "Events respond to actions such as button clicks.",
        "JavaScript can update webpage content."
      ]
    }
  ],

  3: [
    {
      lessonId: 4,
      title: "Introduction to SQL",
      content:
        "SQL is used to communicate with relational databases and perform database operations.",
      points: [
        "SELECT retrieves data.",
        "INSERT adds records.",
        "UPDATE modifies records.",
        "DELETE removes records."
      ]
    }
  ]
};

const quizData = {
  1: [
    {
      question: "Which keyword is used to create a class in Java?",
      options: ["function", "class", "define", "object"],
      answer: 1
    },
    {
      question: "Which component executes Java bytecode?",
      options: ["JDK", "JRE", "JVM", "Compiler only"],
      answer: 2
    },
    {
      question: "Which concept supports code reuse through a parent class?",
      options: [
        "Inheritance",
        "Encapsulation",
        "Abstraction",
        "Compilation"
      ],
      answer: 0
    },
    {
      question: "Which of these is a Java primitive data type?",
      options: ["String", "int", "Scanner", "System"],
      answer: 1
    },
    {
      question: "Which method is the usual starting point of a Java application?",
      options: ["start()", "run()", "main()", "execute()"],
      answer: 2
    }
  ],

  2: [
    {
      question: "What does HTML stand for?",
      options: [
        "HyperText Markup Language",
        "HighText Machine Language",
        "HyperTool Markup Language",
        "Home Text Management Language"
      ],
      answer: 0
    },
    {
      question: "Which language styles a web page?",
      options: ["SQL", "Java", "CSS", "HTML only"],
      answer: 2
    },
    {
      question: "Which HTML tag creates a hyperlink?",
      options: ["<p>", "<a>", "<h1>", "<img>"],
      answer: 1
    },
    {
      question: "Which HTML tag displays an image?",
      options: ["<image>", "<picture-file>", "<img>", "<src>"],
      answer: 2
    },
    {
      question: "Which CSS property changes text color?",
      options: ["font-style", "background", "color", "text-size"],
      answer: 2
    }
  ]
};

function Dashboard() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [studentName, setStudentName] = useState("Student");
  const [userId, setUserId] = useState(null);

  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);

  // Store actual MySQL lesson IDs in this array.
  const [completedLessons, setCompletedLessons] = useState([]);
  const [progressLoading, setProgressLoading] = useState(false);

  const [showQuiz, setShowQuiz] = useState(false);
  const [answers, setAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizSaving, setQuizSaving] = useState(false);
  const [quizMessage, setQuizMessage] = useState("");
  const [quizResults, setQuizResults] = useState([]);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const storedUser = sessionStorage.getItem("loggedInUser");

        if (!storedUser) {
          setError("Please log in to view your dashboard.");
          return;
        }

        const user = JSON.parse(storedUser);
        const currentUserId = user.user_id ?? user.userId ?? user.id;

        if (!currentUserId) {
          setError(
            "User ID not found. Please log out and log in again."
          );
          return;
        }

        setUserId(currentUserId);
        setStudentName(user.name ?? user.fullName ?? "Student");

        const coursesResponse = await fetch(
          `${ENROLLMENTS_API}?userId=${encodeURIComponent(currentUserId)}`
        );

        if (!coursesResponse.ok) {
          throw new Error("Unable to load enrolled courses.");
        }

        const coursesData = await coursesResponse.json();

        if (!Array.isArray(coursesData)) {
          throw new Error("Unexpected course data received.");
        }

        setCourses(coursesData);

        // Load saved lesson completion from MySQL.
        const progressResponse = await fetch(
          `${PROGRESS_API}?userId=${encodeURIComponent(currentUserId)}`
        );

        if (progressResponse.ok) {
          const progressData = await progressResponse.json();

          if (progressData.success && Array.isArray(progressData.progress)) {
            const completedIds = progressData.progress
              .filter((item) => Number(item.completed) === 1)
              .map((item) => Number(item.lesson_id));

            setCompletedLessons([...new Set(completedIds)]);
          } else if (progressData.success === false) {
            console.error(
              "Progress could not be loaded:",
              progressData.message
            );
          }
        } else {
          console.error("Could not load saved lesson progress.");
        }

        // Load previously saved quiz attempts.
        const resultsResponse = await fetch(
          `${QUIZ_RESULTS_API}?userId=${encodeURIComponent(currentUserId)}`
        );

        if (resultsResponse.ok) {
          const resultsData = await resultsResponse.json();

          if (resultsData.success && Array.isArray(resultsData.results)) {
            setQuizResults(resultsData.results);
          } else if (resultsData.success === false) {
            console.error(
              "Quiz results could not be loaded:",
              resultsData.message
            );
          }
        } else {
          console.error("Could not load previous quiz results.");
        }
      } catch (err) {
        console.error("Dashboard error:", err);
        setError(
          "Could not load courses. Please check that the backend is running."
        );
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  function getLessons(courseId) {
    return lessonData[courseId] || [];
  }

  function openCourse(course) {
    setSelectedCourse(course);
    setSelectedLesson(null);
    setShowQuiz(false);
    setAnswers({});
    setQuizSubmitted(false);
    setQuizMessage("");
  }

  function backToCourses() {
    setSelectedCourse(null);
    setSelectedLesson(null);
    setShowQuiz(false);
    setAnswers({});
    setQuizSubmitted(false);
    setQuizMessage("");
  }

  async function markLessonComplete(lessonId) {
    if (!userId || completedLessons.includes(lessonId)) {
      return;
    }

    setProgressLoading(true);
    setQuizMessage("");

    try {
      const response = await fetch(PROGRESS_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          userId: Number(userId),
          lessonId: Number(lessonId),
          completed: 1
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Could not save lesson progress.");
      }

      setCompletedLessons((previous) =>
        previous.includes(lessonId)
          ? previous
          : [...previous, lessonId]
      );
    } catch (err) {
      console.error("Lesson progress error:", err);
      alert(
        "Could not save lesson completion. Check the backend and try again."
      );
    } finally {
      setProgressLoading(false);
    }
  }

  const currentLessons = selectedCourse
    ? getLessons(selectedCourse.course_id)
    : [];

  const currentQuiz = selectedCourse
    ? quizData[selectedCourse.course_id] || []
    : [];

  const score = currentQuiz.filter(
    (question, index) => answers[index] === question.answer
  ).length;

  const totalCompleted = completedLessons.length;

  async function submitQuiz() {
    if (!userId || !selectedCourse || currentQuiz.length === 0) {
      return;
    }

    const quizIdByCourse = {
      1: 1,
      2: 2,
      3: 3
    };

    const quizId = quizIdByCourse[selectedCourse.course_id];

    if (!quizId) {
      setQuizMessage("A quiz record is not configured for this course.");
      return;
    }

    setQuizSubmitted(true);
    setQuizSaving(true);
    setQuizMessage("");

    try {
      const response = await fetch(QUIZ_RESULTS_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          userId: Number(userId),
          quizId,
          score
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Could not save quiz result.");
      }

      const newResult = {
        quiz_id: quizId,
        course_id: selectedCourse.course_id,
        title: `${selectedCourse.title} Quiz`,
        score
      };

      setQuizResults((previous) => [newResult, ...previous]);
      setQuizMessage("Quiz score saved successfully in MySQL.");
    } catch (err) {
      console.error("Quiz result error:", err);
      setQuizMessage(
        "Your score is shown below, but it could not be saved to MySQL. Please check the backend."
      );
    } finally {
      setQuizSaving(false);
    }
  }

  return (
    <div className="app">
      <nav className="navbar">
        <h2>
          <Link
            to="/"
            style={{
              color: "inherit",
              textDecoration: "none"
            }}
          >
            LearnHub
          </Link>
        </h2>

        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/dashboard">Dashboard</Link>
        </div>
      </nav>

      <main>
        <section className="dashboard">
          <h1>Welcome, {studentName}!</h1>

          <p>
            Learn at your own pace and track your learning progress.
          </p>

          <div className="dashboard-stats">
            <div>
              <h3>{loading ? "..." : courses.length}</h3>
              <p>Enrolled Courses</p>
            </div>

            <div>
              <h3>{totalCompleted}</h3>
              <p>Lessons Completed</p>
            </div>
          </div>
        </section>

        {loading && <p>Loading your courses...</p>}

        {error && (
          <p className="message" role="alert">
            {error}
          </p>
        )}

        {!loading && !error && !selectedCourse && (
          <section id="my-courses">
            <h2>My Enrolled Courses</h2>

            {courses.length === 0 ? (
              <div>
                <p>You have not enrolled in any courses yet.</p>
                <Link to="/">Explore Courses</Link>
              </div>
            ) : (
              <div className="course-grid">
                {courses.map((course) => {
                  const lessons = getLessons(Number(course.course_id));

                  const completedCount = lessons.filter((lesson) =>
                    completedLessons.includes(lesson.lessonId)
                  ).length;

                  return (
                    <article
                      className="course-card"
                      key={course.course_id}
                    >
                      <div className="course-icon">📘</div>

                      <h3>{course.title}</h3>

                      <p>{course.description}</p>

                      <div className="course-info">
                        <span>
                          Instructor: {course.instructor}
                        </span>

                        <span>
                          Duration: {course.duration}
                        </span>
                      </div>

                      <p>✓ Enrolled</p>

                      <p>
                        Lessons completed: {completedCount}/{lessons.length}
                      </p>

                      <button
                        type="button"
                        onClick={() => openCourse(course)}
                      >
                        Open Course
                      </button>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {!loading && !error && selectedCourse && (
          <section className="lesson-section">
            <button type="button" onClick={backToCourses}>
              ← Back to My Courses
            </button>

            <h2>{selectedCourse.title}</h2>

            <p>{selectedCourse.description}</p>

            <p>
              Instructor: {selectedCourse.instructor} | Duration:{" "}
              {selectedCourse.duration}
            </p>

            <h3>📚 Course Lessons</h3>

            <div className="lesson-list">
              {currentLessons.map((lesson, index) => {
                const isComplete = completedLessons.includes(
                  lesson.lessonId
                );

                return (
                  <article
                    className="course-card"
                    key={lesson.lessonId}
                  >
                    <h3>
                      {index + 1}. {lesson.title}
                    </h3>

                    <p>
                      {isComplete
                        ? "✅ Completed"
                        : "📖 Not completed"}
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        setSelectedLesson(
                          selectedLesson === index ? null : index
                        )
                      }
                    >
                      {selectedLesson === index
                        ? "Hide Lesson"
                        : "Read Lesson"}
                    </button>

                    {selectedLesson === index && (
                      <div className="lesson-content">
                        <p>{lesson.content}</p>

                        <h4>Key Points</h4>

                        <ul>
                          {lesson.points.map((point, pointIndex) => (
                            <li key={pointIndex}>{point}</li>
                          ))}
                        </ul>

                        <button
                          type="button"
                          disabled={isComplete || progressLoading}
                          onClick={() =>
                            markLessonComplete(lesson.lessonId)
                          }
                        >
                          {isComplete
                            ? "Lesson Completed ✓"
                            : progressLoading
                              ? "Saving..."
                              : "Mark as Completed"}
                        </button>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>

            <section className="course-card">
              <h3>📝 Course Quiz</h3>

              <p>
                Test your understanding of {selectedCourse.title}.
              </p>

              {!showQuiz ? (
                <button
                  type="button"
                  onClick={() => {
                    setAnswers({});
                    setQuizSubmitted(false);
                    setQuizMessage("");
                    setShowQuiz(true);
                  }}
                >
                  Start Quiz
                </button>
              ) : currentQuiz.length === 0 ? (
                <p>No quiz is available for this course yet.</p>
              ) : (
                <div className="quiz-content">
                  {currentQuiz.map((question, index) => (
                    <div key={index}>
                      <h4>
                        {index + 1}. {question.question}
                      </h4>

                      {question.options.map((option, optionIndex) => (
                        <label
                          key={optionIndex}
                          style={{
                            display: "block",
                            margin: "10px 0",
                            cursor: "pointer"
                          }}
                        >
                          <input
                            type="radio"
                            name={`question-${index}`}
                            checked={answers[index] === optionIndex}
                            disabled={quizSubmitted}
                            onChange={() =>
                              setAnswers((previous) => ({
                                ...previous,
                                [index]: optionIndex
                              }))
                            }
                          />
                          {" "}{option}
                        </label>
                      ))}

                      {quizSubmitted && (
                        <p>
                          {answers[index] === question.answer
                            ? "✅ Correct!"
                            : "❌ Incorrect."}
                          {" "}Correct answer:{" "}
                          {question.options[question.answer]}
                        </p>
                      )}

                      <hr />
                    </div>
                  ))}

                  {!quizSubmitted ? (
                    <button
                      type="button"
                      onClick={submitQuiz}
                      disabled={quizSaving}
                    >
                      Submit Quiz
                    </button>
                  ) : (
                    <div>
                      <h3>
                        Your Score: {score}/{currentQuiz.length}
                      </h3>

                      <p>
                        Percentage:{" "}
                        {Math.round((score / currentQuiz.length) * 100)}%
                      </p>

                      {quizSaving && <p>Saving your quiz score...</p>}

                      {quizMessage && (
                        <p role="status">{quizMessage}</p>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setAnswers({});
                          setQuizSubmitted(false);
                          setQuizMessage("");
                        }}
                      >
                        Try Again
                      </button>
                    </div>
                  )}
                </div>
              )}
            </section>
          </section>
        )}

        {!loading && !error && !selectedCourse && quizResults.length > 0 && (
          <section className="course-card">
            <h2>📊 Previous Quiz Results</h2>

            {quizResults.map((result, index) => (
              <p key={result.result_id ?? `${result.quiz_id}-${index}`}>
                {result.title || `Quiz ${result.quiz_id}`} — Score:{" "}
                {result.score}
              </p>
            ))}
          </section>
        )}

        <p>
          <Link to="/">← Back to Home</Link>
        </p>
      </main>

      <footer>
        <p>LearnHub — Online Learning Platform</p>
      </footer>
    </div>
  );
}

export default Dashboard;
