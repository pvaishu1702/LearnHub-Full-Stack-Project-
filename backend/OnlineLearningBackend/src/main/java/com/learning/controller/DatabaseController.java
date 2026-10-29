
package com.learning.controller;

import java.sql.Connection;
import javax.sql.DataSource;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class DatabaseController {

    @Autowired
    private DataSource dataSource;

    @GetMapping("/db-test")
    public String testDatabase() {
        try (Connection connection = dataSource.getConnection()) {
            if (connection.isValid(5)) {
                return "MySQL database connected successfully!";
            }
            return "MySQL connection is not valid.";
        } catch (Exception e) {
            e.printStackTrace();
            return "Database connection failed: " + e.getMessage();
        }
    }
}
