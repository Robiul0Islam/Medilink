package com.medilink.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/auth/**", "/api/auth/**", "/error", "/uploads/**", "/ws-chat/**", "/api/ws-chat/**").permitAll()
                .requestMatchers("/admin/**", "/api/admin/**").hasRole("ADMIN")
                .requestMatchers("/doctor/all", "/api/doctor/all").hasAnyRole("PATIENT", "DOCTOR", "ADMIN")
                .requestMatchers("/doctor/{id:\\d+}", "/api/doctor/{id:\\d+}").hasAnyRole("PATIENT", "DOCTOR", "ADMIN")
                .requestMatchers("/doctor/**", "/api/doctor/**").hasRole("DOCTOR")
                .requestMatchers("/patient/**", "/api/patient/**").hasRole("PATIENT")
                .requestMatchers("/reviews/**", "/api/reviews/**").hasAnyRole("PATIENT", "DOCTOR", "ADMIN")
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/posts", "/api/posts").hasAnyRole("PATIENT", "DOCTOR", "ADMIN")
                .requestMatchers(org.springframework.http.HttpMethod.POST, "/posts", "/api/posts").hasRole("DOCTOR")
                .requestMatchers("/posts/pending", "/api/posts/pending").hasRole("ADMIN")
                .requestMatchers("/posts/*/approve", "/api/posts/*/approve").hasRole("ADMIN")
                .requestMatchers("/posts/*/reject", "/api/posts/*/reject").hasRole("ADMIN")
                .anyRequest().authenticated()
            )
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:5173", "http://localhost:3000"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
