
import { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link
} from "react-router-dom";

import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

import "./App.css";

function Home() {
  const [message, setMessage] = useState("");
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [enrollingCourseId, setEnrollingCourseId] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8080/OnlineLearningBackend/api/courses")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load courses");
        }
        return response.json();
      })
      .then((data) => {
        setCourses(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching courses:", error);
        setError(
          "Unable to load courses. Please check whether the backend is running."
        );
        setLoading(false);
      });
  }, []);

  const getCourseIcon = (title) => {
    if (title.includes("Java")) return "☕";
    if (title.includes("Web")) return "🌐";
    if (title.includes("Database")) return "🗄️";
    return "📘";
  };

  const handleEnroll = async (course) => {
    setMessage("");

    let loggedInUser;

    try {
      const storedUser = sessionStorage.getItem("loggedInUser");

      if (!storedUser) {
        setMessage("Please log in before enrolling in a course.");
        return;
      }

      loggedInUser = JSON.parse(storedUser);
    } catch (error) {
      console.error("Unable to read logged-in user:", error);
      setMessage("Please log in again before enrolling.");
      return;
    }

    const userId =
      loggedInUser?.user_id ??
      loggedInUser?.userId ??
      loggedInUser?.id;

    if (!userId) {
      setMessage(
        "Your user ID was not found. Please log out and log in again."
      );
      return;
    }

    setEnrollingCourseId(course.course_id);

    try {
      const response = await fetch(
        "http://localhost:8080/OnlineLearningBackend/api/enrollments",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            userId: Number(userId),
            courseId: Number(course.course_id)
          })
        }
      );

      if (!response.ok) {
        throw new Error("The server could not process your enrollment.");
      }

      const data = await response.json();

      if (data.success) {
        setEnrolledCourses((previous) =>
          previous.includes(course.course_id)
            ? previous
            : [...previous, course.course_id]
        );

        setMessage(`Successfully enrolled in ${course.title}!`);
      } else {
        setMessage(
          data.message || "Unable to enroll in this course."
        );
      }
    } catch (error) {
      console.error("Enrollment error:", error);
      setMessage(
        "Enrollment failed. Please check that the backend is running and try again."
      );
    } finally {
      setEnrollingCourseId(null);
    }
  };

  return (
    <div className="app">
      <nav className="navbar">
        <h2>
          <Link
            to="/"
            style={{ color: "inherit", textDecoration: "none" }}
          >
            LearnHub
          </Link>
        </h2>

        <div className="nav-links">
          <a href="#home">Home</a>
          <a href="#courses">Courses</a>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/register">Register</Link>
          <Link to="/login">Login</Link>
        </div>
      </nav>

      <header className="hero" id="home">
        <p className="eyebrow">YOUR LEARNING JOURNEY STARTS HERE</p>
        <h1>Learn Something New Every Day</h1>
        <p>
          Explore courses, improve your skills, and achieve your goals.
        </p>
        <a className="explore-button" href="#courses">
          Explore Courses
        </a>
      </header>

      <main>
        <section id="courses">
          <h2>Popular Courses</h2>
          <p className="section-description">
            Discover courses designed to help you grow.
          </p>

          {loading && <p>Loading courses...</p>}

          {error && <p className="message">{error}</p>}

          {!loading && !error && courses.length === 0 && (
            <p>No courses are available right now.</p>
          )}

          {!loading && !error && (
            <div className="course-grid">
              {courses.map((course) => {
                const isEnrolled = enrolledCourses.includes(
                  course.course_id
                );

                return (
                  <article
                    className="course-card"
                    key={course.course_id}
                  >
                    <div className="course-icon">
                      {getCourseIcon(course.title)}
                    </div>

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

                    <button
                      className="course-button"
                      onClick={() => handleEnroll(course)}
                      disabled={
                        enrollingCourseId === course.course_id ||
                        isEnrolled
                      }
                    >
                      {enrollingCourseId === course.course_id
                        ? "Enrolling..."
                        : isEnrolled
                        ? "Enrolled"
                        : "Enroll Now"}
                    </button>
                  </article>
                );
              })}
            </div>
          )}

          {message && (
            <p className="message" role="status">
              {message}
            </p>
          )}
        </section>

        <section className="dashboard" id="dashboard">
          <h2>Your Learning Dashboard</h2>
          <p>
            Start exploring courses to begin your learning journey.
          </p>

          <div className="dashboard-stats">
            <div>
              <h3>{enrolledCourses.length}</h3>
              <p>Courses Enrolled This Session</p>
            </div>

            <div>
              <h3>0%</h3>
              <p>Learning Progress</p>
            </div>

            <div>
              <h3>0</h3>
              <p>Quizzes Completed</p>
            </div>
          </div>

          <p>
            <Link to="/dashboard">View My Account →</Link>
          </p>
        </section>

        {/* Meet Our Team Section */}
        <section className="team-section" id="team">
          <h2>Meet Our Team</h2>
          <p className="section-description">
            The team behind LearnHub
          </p>

          <div className="team-grid">
            <div className="team-card">
              <h3>K. Manogna Sai Reddy</h3>
              <p>Roll No: 24521A0583</p>
            </div>

            <div className="team-card">
              <h3>Pendyala Vaishnavi</h3>
              <p>Roll No: 24521A0593</p>
            </div>

            <div className="team-card">
              <h3>Puppala Sahasra</h3>
              <p>Roll No: 24521A05C4</p>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <p>LearnHub — Online Learning Platform</p>
      </footer>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
