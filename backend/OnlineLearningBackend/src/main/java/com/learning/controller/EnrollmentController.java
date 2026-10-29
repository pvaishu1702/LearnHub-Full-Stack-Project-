
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
@RequestMapping("/api/enrollments")
public class EnrollmentController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    // Enroll a student in a course
    @PostMapping
    public Map<String, Object> enrollCourse(
            @RequestBody Map<String, Object> request) {

        Map<String, Object> result = new HashMap<>();

        try {
            int userId = Integer.parseInt(
                    String.valueOf(request.get("userId")));

            int courseId = Integer.parseInt(
                    String.valueOf(request.get("courseId")));

            if (userId <= 0 || courseId <= 0) {
                result.put("success", false);
                result.put("message", "Invalid user or course ID.");
                return result;
            }

            Integer userCount = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM users WHERE user_id = ?",
                    Integer.class, userId);

            Integer courseCount = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM courses WHERE course_id = ?",
                    Integer.class, courseId);

            if (userCount == null || userCount == 0) {
                result.put("success", false);
                result.put("message", "Student not found.");
                return result;
            }

            if (courseCount == null || courseCount == 0) {
                result.put("success", false);
                result.put("message", "Course not found.");
                return result;
            }

            Integer existingEnrollment = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM enrollments " +
                    "WHERE user_id = ? AND course_id = ?",
                    Integer.class, userId, courseId);

            if (existingEnrollment != null
                    && existingEnrollment > 0) {
                result.put("success", false);
                result.put("message",
                        "You are already enrolled in this course.");
                return result;
            }

            jdbcTemplate.update(
                    "INSERT INTO enrollments (user_id, course_id) " +
                    "VALUES (?, ?)",
                    userId, courseId);

            result.put("success", true);
            result.put("message",
                    "Successfully enrolled in the course!");

        } catch (NumberFormatException e) {
            result.put("success", false);
            result.put("message", "Invalid user or course ID.");
        } catch (Exception e) {
            e.printStackTrace();
            result.put("success", false);
            result.put("message",
                    "Enrollment failed. Please try again.");
        }

        return result;
    }

    // Get all courses enrolled by a particular student
    @GetMapping
    public List<Map<String, Object>> getEnrollments(
            @RequestParam("userId") int userId) {

        String sql =
                "SELECT c.course_id, c.title, c.description, " +
                "c.instructor, c.duration " +
                "FROM enrollments e " +
                "JOIN courses c ON e.course_id = c.course_id " +
                "WHERE e.user_id = ? " +
                "ORDER BY c.course_id";

        return jdbcTemplate.queryForList(sql, userId);
    }
}
