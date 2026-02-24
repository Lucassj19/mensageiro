package com.zedia.mensageiro.controller;

import com.zedia.mensageiro.dto.Dtos.*;
import com.zedia.mensageiro.service.EmailService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/emails")
@RequiredArgsConstructor
@Tag(name = "Emails", description = "Envio de e-mails com templates")
@SecurityRequirement(name = "bearerAuth")
public class EmailController {

    private final EmailService emailService;

    @PostMapping("/send")
    @Operation(summary = "Enviar e-mail usando template")
    public ResponseEntity<EmailLogResponse> send(@Valid @RequestBody SendEmailRequest request, Authentication auth) {
        return ResponseEntity.ok(emailService.sendEmail(request, auth));
    }

    @GetMapping("/history")
    @Operation(summary = "Histórico de e-mails enviados")
    public ResponseEntity<List<EmailLogResponse>> history(Authentication auth) {
        return ResponseEntity.ok(emailService.getHistory(auth));
    }
}