
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Auth.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:8080/OnlineLearningBackend/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            password: password,
          }),
        }
      );

      const data = await response.json();

      console.log("Login API response:", data);

      if (!response.ok || !data.success) {
        setMessage(
          data.message || "Invalid email or password."
        );
        return;
      }

      // Support common user ID and user detail formats.
      const user = data.user || data;

      const userId =
        user.user_id ??
        user.userId ??
        user.id ??
        data.user_id ??
        data.userId ??
        data.id;

      const userName =
        user.name ??
        user.fullName ??
        user.username ??
        data.name ??
        data.fullName ??
        "Student";

      const userEmail =
        user.email ?? data.email ?? email.trim();

      if (userId === undefined || userId === null || userId === "") {
        console.error("Login response does not contain a user ID:", data);
        setMessage(
          "Login succeeded, but the user ID was not returned. Please check the backend login response."
        );
        return;
      }

      const loggedInUser = {
        user_id: userId,
        name: userName,
        email: userEmail,
      };

      sessionStorage.setItem(
        "loggedInUser",
        JSON.stringify(loggedInUser)
      );

      console.log(
        "Saved logged-in user:",
        sessionStorage.getItem("loggedInUser")
      );

      setMessage("Login successful! Welcome, " + userName + ".");

      setTimeout(() => {
        navigate("/dashboard");
      }, 700);

    } catch (error) {
      console.error("Login error:", error);

      setMessage(
        "Unable to connect to the login service. Check whether the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Welcome Back!</h1>

        <p className="auth-subtitle">
          Log in to continue your learning journey.
        </p>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {message && (
          <p className="auth-message" role="status">
            {message}
          </p>
        )}

        <p className="auth-footer">
          Don't have an account?{" "}
          <Link to="/register">Register here</Link>
        </p>

        <p className="auth-footer">
          <Link to="/">← Back to Home</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
