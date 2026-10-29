
package com.learning.controller;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.LinkedHashMap;
import java.util.Map;

import javax.sql.DataSource;

import org.mindrot.jbcrypt.BCrypt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class LoginController {

    @Autowired
    private DataSource dataSource;

    @PostMapping(
        value = "/login",
        consumes = "application/json",
        produces = "application/json"
    )
    public Map<String, Object> login(
            @RequestBody Map<String, String> request)
            throws Exception {

        Map<String, Object> response = new LinkedHashMap<>();

        String email = request.get("email");
        String password = request.get("password");

        if (email == null || email.trim().isEmpty()
                || password == null || password.isEmpty()) {
            response.put("success", false);
            response.put("message", "Email and password are required.");
            return response;
        }

        String sql =
            "SELECT user_id, name, email, password "
            + "FROM users WHERE email = ?";

        try (Connection con = dataSource.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setString(1, email.trim());

            try (ResultSet rs = ps.executeQuery()) {

                if (rs.next()) {
                    String storedHash = rs.getString("password");

                    if (storedHash != null
                            && BCrypt.checkpw(password, storedHash)) {

                        response.put("success", true);
                        response.put("message", "Login successful!");
                        response.put("user_id", rs.getInt("user_id"));
                        response.put("name", rs.getString("name"));
                        response.put("email", rs.getString("email"));

                    } else {
                        response.put("success", false);
                        response.put("message",
                                "Invalid email or password.");
                    }

                } else {
                    response.put("success", false);
                    response.put("message",
                            "Invalid email or password.");
                }
            }
        }

        return response;
    }
}
