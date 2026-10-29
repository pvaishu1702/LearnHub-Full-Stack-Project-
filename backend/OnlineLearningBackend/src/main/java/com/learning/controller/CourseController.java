
package com.learning.controller;

import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.LinkedHashMap;

import javax.sql.DataSource;

import java.sql.Connection;
import java.sql.PreparedStatement;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/courses")
public class CourseController {

    @Autowired
    private DataSource dataSource;

   @GetMapping(produces = "application/json")
    public List<Map<String, Object>> getCourses() throws Exception {

        List<Map<String, Object>> courses = new ArrayList<>();

        String sql = "SELECT course_id, title, description, "
                   + "instructor, duration FROM courses";

        try (Connection con = dataSource.getConnection();
             PreparedStatement ps = con.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                Map<String, Object> course = new LinkedHashMap<>();

                course.put("course_id", rs.getInt("course_id"));
                course.put("title", rs.getString("title"));
                course.put("description", rs.getString("description"));
                course.put("instructor", rs.getString("instructor"));
                course.put("duration", rs.getString("duration"));

                courses.add(course);
            }
        }

        return courses;
    }
}
