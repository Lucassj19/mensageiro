package com.zedia.mensageiro.dto;

import com.zedia.mensageiro.entity.Template;
import com.zedia.mensageiro.entity.User;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public class Dtos {

    @Getter @Setter
    public static class RegisterRequest {
        @NotBlank String name;
        @Email @NotBlank String email;
        @NotBlank String password;
    }

    @Getter @Setter
    public static class LoginRequest {
        @Email @NotBlank String email;
        @NotBlank String password;
    }

    @Getter @Setter @Builder @AllArgsConstructor @NoArgsConstructor
    public static class AuthResponse {
        String token;
        String email;
        String name;
        String role;
    }

    @Getter @Setter @Builder @AllArgsConstructor @NoArgsConstructor
    public static class UserResponse {
        Long id;
        String name;
        String email;
        String role;
        LocalDateTime createdAt;

        public static UserResponse from(User u) {
            return UserResponse.builder()
                    .id(u.getId()).name(u.getName()).email(u.getEmail())
                    .role(u.getRole().name()).createdAt(u.getCreatedAt()).build();
        }
    }

    @Getter @Setter
    public static class TemplateRequest {
        @NotBlank String name;
        @NotNull Template.TemplateCategory category;
        @NotBlank String subject;
        @NotBlank String body;
    }

    @Getter @Setter @Builder @AllArgsConstructor @NoArgsConstructor
    public static class TemplateResponse {
        Long id;
        String name;
        String category;
        String subject;
        String body;
        String ownerName;
        String ownerEmail;
        LocalDateTime createdAt;
        LocalDateTime updatedAt;

        public static TemplateResponse from(Template t) {
            return TemplateResponse.builder()
                    .id(t.getId()).name(t.getName()).category(t.getCategory().name())
                    .subject(t.getSubject()).body(t.getBody())
                    .ownerName(t.getOwner().getName()).ownerEmail(t.getOwner().getEmail())
                    .createdAt(t.getCreatedAt()).updatedAt(t.getUpdatedAt()).build();
        }
    }

    @Getter @Setter
    public static class SendEmailRequest {
        @NotNull Long templateId;
        @NotNull List<String> recipientEmails;
        Map<String, String> variables;
    }

    @Getter @Setter @Builder @AllArgsConstructor @NoArgsConstructor
    public static class EmailLogResponse {
        Long id;
        String subject;
        String body;
        List<String> recipients;
        String status;
        LocalDateTime sentAt;
        String senderName;
        String templateName;
    }
}