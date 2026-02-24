package com.zedia.mensageiro.service;

import com.zedia.mensageiro.dto.Dtos.*;
import com.zedia.mensageiro.entity.EmailLog;
import com.zedia.mensageiro.entity.Template;
import com.zedia.mensageiro.entity.User;
import com.zedia.mensageiro.repository.EmailLogRepository;
import com.zedia.mensageiro.repository.TemplateRepository;
import com.zedia.mensageiro.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;
    private final TemplateRepository templateRepository;
    private final UserRepository userRepository;
    private final EmailLogRepository emailLogRepository;

    @Value("${app.mail.from}")
    private String fromEmail;

    public EmailLogResponse sendEmail(SendEmailRequest request, Authentication auth) {
        User sender = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado"));

        Template template = templateRepository.findById(request.getTemplateId())
                .orElseThrow(() -> new IllegalArgumentException("Template não encontrado"));

        List<String> recipients = request.getRecipientEmails();
        for (String email : recipients) {
            if (!userRepository.existsByEmail(email)) {
                throw new IllegalArgumentException("Usuário não encontrado: " + email);
            }
        }

        String resolvedSubject = resolveVariables(template.getSubject(), request.getVariables());
        String resolvedBody = resolveVariables(template.getBody(), request.getVariables());

        EmailLog log = EmailLog.builder()
                .sender(sender)
                .template(template)
                .subject(resolvedSubject)
                .body(resolvedBody)
                .recipients(recipients)
                .sentAt(LocalDateTime.now())
                .build();

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(recipients.toArray(new String[0]));
            message.setSubject(resolvedSubject);
            message.setText(resolvedBody);
            mailSender.send(message);
            log.setStatus(EmailLog.EmailStatus.SENT);
            logger.info("Email sent from {} to {}", sender.getEmail(), recipients);
        } catch (Exception e) {
            log.setStatus(EmailLog.EmailStatus.FAILED);
            log.setErrorMessage(e.getMessage());
            logger.warn("Failed to send email: {}", e.getMessage());
        }

        EmailLog saved = emailLogRepository.save(log);
        return toResponse(saved);
    }

    public List<EmailLogResponse> getHistory(Authentication auth) {
        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado"));
        return emailLogRepository.findBySenderOrderBySentAtDesc(user)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    private String resolveVariables(String text, Map<String, String> variables) {
        if (variables == null || variables.isEmpty()) return text;
        String result = text;
        for (Map.Entry<String, String> entry : variables.entrySet()) {
            result = result.replace("{{" + entry.getKey() + "}}", entry.getValue());
        }
        return result;
    }

    private EmailLogResponse toResponse(EmailLog log) {
        return EmailLogResponse.builder()
                .id(log.getId())
                .subject(log.getSubject())
                .body(log.getBody())
                .recipients(log.getRecipients())
                .status(log.getStatus().name())
                .sentAt(log.getSentAt())
                .senderName(log.getSender().getName())
                .templateName(log.getTemplate() != null ? log.getTemplate().getName() : null)
                .build();
    }
}