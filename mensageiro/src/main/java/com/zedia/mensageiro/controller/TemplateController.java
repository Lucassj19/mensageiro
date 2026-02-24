package com.zedia.mensageiro.controller;

import com.zedia.mensageiro.dto.Dtos.*;
import com.zedia.mensageiro.service.TemplateService;
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
@RequestMapping("/api/templates")
@RequiredArgsConstructor
@Tag(name = "Templates", description = "Gestão de templates de e-mail")
@SecurityRequirement(name = "bearerAuth")
public class TemplateController {

    private final TemplateService templateService;

    @PostMapping
    @Operation(summary = "Criar template")
    public ResponseEntity<TemplateResponse> create(@Valid @RequestBody TemplateRequest request, Authentication auth) {
        return ResponseEntity.ok(templateService.create(request, auth));
    }

    @GetMapping("/mine")
    @Operation(summary = "Listar meus templates")
    public ResponseEntity<List<TemplateResponse>> listMine(Authentication auth) {
        return ResponseEntity.ok(templateService.listMine(auth));
    }

    @GetMapping
    @Operation(summary = "Listar todos os templates")
    public ResponseEntity<List<TemplateResponse>> listAll() {
        return ResponseEntity.ok(templateService.listAll());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar template por ID")
    public ResponseEntity<TemplateResponse> getById(@PathVariable Long id, Authentication auth) {
        return ResponseEntity.ok(templateService.getById(id, auth));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar template")
    public ResponseEntity<TemplateResponse> update(@PathVariable Long id, @Valid @RequestBody TemplateRequest request, Authentication auth) {
        return ResponseEntity.ok(templateService.update(id, request, auth));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Deletar template")
    public ResponseEntity<Void> delete(@PathVariable Long id, Authentication auth) {
        templateService.delete(id, auth);
        return ResponseEntity.noContent().build();
    }
}