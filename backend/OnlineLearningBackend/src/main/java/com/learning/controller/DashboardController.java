
package com.learning.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @GetMapping("/{userId}")
    public Map<String, Object> getDashboard(
            @PathVariable int userId) {

        Map<String, Object> result = new HashMap<>();

        try {
            // Get the user's enrolled courses.
            String coursesSql =
                "SELECT c.course_id, c.title, c.description, " +
                "c.instructor, c.duration " +
                "FROM courses c " +
                "INNER JOIN enrollments e " +
                "ON c.course_id = e.course_id " +
                "WHERE e.user_id = ? " +
                "ORDER BY e.enrollment_date DESC";

            List<Map<String, Object>> enrolledCourses =
                jdbcTemplate.queryForList(coursesSql, userId);

            // Count lessons belonging to the user's enrolled courses.
            String totalLessonsSql =
                "SELECT COUNT(*) FROM lessons l " +
                "INNER JOIN enrollments e " +
                "ON l.course_id = e.course_id " +
                "WHERE e.user_id = ?";

            int totalLessons = jdbcTemplate.queryForObject(
                totalLessonsSql, Integer.class, userId);

            // Count completed lessons in those courses.
            String completedLessonsSql =
                "SELECT COUNT(DISTINCT lp.lesson_id) " +
                "FROM learning_progress lp " +
                "INNER JOIN lessons l ON lp.lesson_id = l.lesson_id " +
                "INNER JOIN enrollments e ON l.course_id = e.course_id " +
                "WHERE lp.user_id = ? " +
                "AND lp.completed = 1 " +
                "AND e.user_id = ?";

            int completedLessons = jdbcTemplate.queryForObject(
                completedLessonsSql,
                Integer.class,
                userId,
                userId
            );

            int progressPercentage = 0;

            if (totalLessons > 0) {
                progressPercentage =
                    (completedLessons * 100) / totalLessons;
            }

            result.put("success", true);
            result.put("enrolledCourses", enrolledCourses);
            result.put("enrolledCount", enrolledCourses.size());
            result.put("totalLessons", totalLessons);
            result.put("completedLessons", completedLessons);
            result.put("progressPercentage", progressPercentage);

        } catch (Exception e) {
            e.printStackTrace();

            result.clear();
            result.put("success", false);
            result.put("message",
                "Unable to load dashboard information.");
        }

        return result;
    }
}
