
package com.learning.controller;
import org.mindrot.jbcrypt.BCrypt;
import java.util.LinkedHashMap;
import java.util.Map;

import javax.sql.DataSource;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class RegisterController {

    @Autowired
    private DataSource dataSource;

    @PostMapping("/register")
    public Map<String, String> register(
            @RequestBody Map<String, String> user) {

        Map<String, String> response = new LinkedHashMap<>();

        String name = user.get("name");
        String email = user.get("email");
        String password = user.get("password");

        if (name == null || name.trim().isEmpty()
                || email == null || email.trim().isEmpty()
                || password == null || password.length() < 6) {
            response.put("message",
                    "Enter a name, email, and password of at least 6 characters.");
            return response;
        }

        String checkSql = "SELECT user_id FROM users WHERE email = ?";
        String insertSql =
                "INSERT INTO users (name, email, password, role) "
                + "VALUES (?, ?, ?, 'STUDENT')";

        try (Connection con = dataSource.getConnection();
             PreparedStatement check = con.prepareStatement(checkSql)) {

            check.setString(1, email.trim());

            try (ResultSet rs = check.executeQuery()) {
                if (rs.next()) {
                    response.put("message",
                            "An account with this email already exists.");
                    return response;
                }
            }

            try (PreparedStatement insert =
                    con.prepareStatement(insertSql)) {

                insert.setString(1, name.trim());
                insert.setString(2, email.trim());
                String hashedPassword = BCrypt.hashpw(password, BCrypt.gensalt(12));
insert.setString(3, hashedPassword);

                insert.executeUpdate();
            }

            response.put("message",
                    "Registration successful! You can now log in.");

        } catch (Exception e) {
            e.printStackTrace();
            response.put("message",
                    "Registration failed. Please check the backend logs.");
        }

        return response;
    }
}
