
package com.learning.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class LearningProgressController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    // Save lesson completion
    @PostMapping("/progress")
    public Map<String, Object> saveProgress(
            @RequestBody Map<String, Object> request) {

        Map<String, Object> response = new HashMap<String, Object>();

        try {
            int userId = Integer.parseInt(
                    request.get("userId").toString());

            int lessonId = Integer.parseInt(
                    request.get("lessonId").toString());

            int completed = request.containsKey("completed")
                    ? Integer.parseInt(request.get("completed").toString())
                    : 1;

            if (completed != 0 && completed != 1) {
                response.put("success", false);
                response.put("message", "Invalid completion value.");
                return response;
            }

            Integer userCount = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM users WHERE user_id = ?",
                    Integer.class, userId);

            Integer lessonCount = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM lessons WHERE lesson_id = ?",
                    Integer.class, lessonId);

            if (userCount == null || userCount == 0
                    || lessonCount == null || lessonCount == 0) {
                response.put("success", false);
                response.put("message", "User or lesson not found.");
                return response;
            }

            Integer existingCount = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM learning_progress "
                    + "WHERE user_id = ? AND lesson_id = ?",
                    Integer.class, userId, lessonId);

            if (existingCount != null && existingCount > 0) {
                jdbcTemplate.update(
                        "UPDATE learning_progress SET completed = ? "
                        + "WHERE user_id = ? AND lesson_id = ?",
                        completed, userId, lessonId);
            } else {
                jdbcTemplate.update(
                        "INSERT INTO learning_progress "
                        + "(user_id, lesson_id, completed) "
                        + "VALUES (?, ?, ?)",
                        userId, lessonId, completed);
            }

            response.put("success", true);
            response.put("message", "Lesson progress saved.");

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Unable to save lesson progress.");
        }

        return response;
    }

    // Get all lesson progress for a student
    @GetMapping("/progress")
    public Map<String, Object> getProgress(
            @RequestParam("userId") int userId) {

        Map<String, Object> response = new HashMap<String, Object>();

        try {
            List<Map<String, Object>> progress =
                    jdbcTemplate.queryForList(
                            "SELECT lp.lesson_id, lp.completed, "
                            + "l.course_id, l.title "
                            + "FROM learning_progress lp "
                            + "JOIN lessons l "
                            + "ON lp.lesson_id = l.lesson_id "
                            + "WHERE lp.user_id = ?",
                            userId);

            response.put("success", true);
            response.put("progress", progress);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Unable to retrieve progress.");
        }

        return response;
    }

    // Save a quiz result
    @PostMapping("/quiz-results")
    public Map<String, Object> saveQuizResult(
            @RequestBody Map<String, Object> request) {

        Map<String, Object> response = new HashMap<String, Object>();

        try {
            int userId = Integer.parseInt(
                    request.get("userId").toString());

            int quizId = Integer.parseInt(
                    request.get("quizId").toString());

            int score = Integer.parseInt(
                    request.get("score").toString());

            if (score < 0) {
                response.put("success", false);
                response.put("message", "Score cannot be negative.");
                return response;
            }

            Integer userCount = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM users WHERE user_id = ?",
                    Integer.class, userId);

            Integer quizCount = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM quizzes WHERE quiz_id = ?",
                    Integer.class, quizId);

            if (userCount == null || userCount == 0
                    || quizCount == null || quizCount == 0) {
                response.put("success", false);
                response.put("message", "User or quiz not found.");
                return response;
            }

            jdbcTemplate.update(
                    "INSERT INTO quiz_results (user_id, quiz_id, score) "
                    + "VALUES (?, ?, ?)",
                    userId, quizId, score);

            response.put("success", true);
            response.put("message", "Quiz result saved.");

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Unable to save quiz result.");
        }

        return response;
    }

    // Retrieve a student's quiz results
    @GetMapping("/quiz-results")
    public Map<String, Object> getQuizResults(
            @RequestParam("userId") int userId) {

        Map<String, Object> response = new HashMap<String, Object>();

        try {
            List<Map<String, Object>> results =
                    jdbcTemplate.queryForList(
                            "SELECT qr.result_id, qr.quiz_id, "
                            + "qr.score, q.course_id, q.title "
                            + "FROM quiz_results qr "
                            + "JOIN quizzes q ON qr.quiz_id = q.quiz_id "
                            + "WHERE qr.user_id = ? "
                            + "ORDER BY qr.result_id DESC",
                            userId);

            response.put("success", true);
            response.put("results", results);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Unable to retrieve quiz results.");
        }

        return response;
    }
}
