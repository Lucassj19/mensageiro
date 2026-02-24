package com.zedia.mensageiro.service;

import com.zedia.mensageiro.dto.Dtos.*;
import com.zedia.mensageiro.entity.User;
import com.zedia.mensageiro.repository.UserRepository;
import com.zedia.mensageiro.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("E-mail já cadastrado");
        }
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(User.Role.USER)
                .build();
        userRepository.save(user);
        String token = jwtUtil.generateToken(user.getEmail());
        return AuthResponse.builder()
                .token(token).email(user.getEmail())
                .name(user.getName()).role(user.getRole().name()).build();
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        User user = userRepository.findByEmail(request.getEmail()).orElseThrow();
        String token = jwtUtil.generateToken(user.getEmail());
        return AuthResponse.builder()
                .token(token).email(user.getEmail())
                .name(user.getName()).role(user.getRole().name()).build();
    }
}