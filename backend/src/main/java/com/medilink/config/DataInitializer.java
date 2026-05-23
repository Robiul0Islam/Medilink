package com.medilink.config;

import com.medilink.model.Admin;
import com.medilink.model.User;
import com.medilink.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Bean
    public CommandLineRunner initData() {
        return args -> {
            // Check if admin exists
            if (!userRepository.existsByEmail("admin@medilink.com")) {
                Admin admin = new Admin();
                admin.setEmail("admin@medilink.com");
                admin.setPassword(passwordEncoder.encode("admin123"));
                admin.setName("Super Admin");
                admin.setRole(User.Role.ADMIN);
                admin.setCity("System");
                admin.setAvatar("https://ui-avatars.com/api/?name=Admin&background=0D8ABC&color=fff");
                
                userRepository.save(admin);
                System.out.println("Default admin created: admin@medilink.com / admin123");
            }
        };
    }
}
