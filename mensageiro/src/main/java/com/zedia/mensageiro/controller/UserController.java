package com.zedia.mensageiro.controller;

import com.zedia.mensageiro.dto.Dtos.*;
import com.zedia.mensageiro.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "Gerenciamento de usuários")
@SecurityRequirement(name = "bearerAuth")
public class UserController {

    private final UserRepository userRepository;

    @GetMapping("/me")
    @Operation(summary = "Perfil do usuário autenticado")
    public ResponseEntity<UserResponse> me(Authentication auth) {
        return userRepository.findByEmail(auth.getName())
                .map(u -> ResponseEntity.ok(UserResponse.from(u)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    @Operation(summary = "Listar todos os usuários")
    public ResponseEntity<List<UserResponse>> list(Authentication auth) {
        List<UserResponse> users = userRepository.findAllByEmailNot(auth.getName())
                .stream().map(UserResponse::from).collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }
}