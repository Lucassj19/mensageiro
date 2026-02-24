package com.zedia.mensageiro.service;

import com.zedia.mensageiro.dto.Dtos.*;
import com.zedia.mensageiro.entity.User;
import com.zedia.mensageiro.repository.UserRepository;
import com.zedia.mensageiro.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private AuthenticationManager authenticationManager;

    @InjectMocks
    private AuthService authService;

    private RegisterRequest registerRequest;
    private LoginRequest loginRequest;
    private User user;

    @BeforeEach
    void setUp() {
        registerRequest = new RegisterRequest();
        registerRequest.setName("João Silva");
        registerRequest.setEmail("joao@empresa.com");
        registerRequest.setPassword("123456");

        loginRequest = new LoginRequest();
        loginRequest.setEmail("joao@empresa.com");
        loginRequest.setPassword("123456");

        user = User.builder()
                .id(1L)
                .name("João Silva")
                .email("joao@empresa.com")
                .password("encoded_password")
                .role(User.Role.USER)
                .build();
    }

    @Test
    void deveRegistrarUsuarioComSucesso() {
        when(userRepository.existsByEmail(any())).thenReturn(false);
        when(passwordEncoder.encode(any())).thenReturn("encoded_password");
        when(userRepository.save(any())).thenReturn(user);
        when(jwtUtil.generateToken(any())).thenReturn("token_fake");

        AuthResponse response = authService.register(registerRequest);

        assertNotNull(response);
        assertEquals("joao@empresa.com", response.getEmail());
        assertEquals("João Silva", response.getName());
        assertEquals("token_fake", response.getToken());
        verify(userRepository, times(1)).save(any());
    }

    @Test
    void deveLancarExcecaoQuandoEmailJaCadastrado() {
        when(userRepository.existsByEmail(any())).thenReturn(true);

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> authService.register(registerRequest)
        );

        assertEquals("E-mail já cadastrado", exception.getMessage());
        verify(userRepository, never()).save(any());
    }

    @Test
    void deveFazerLoginComSucesso() {
        when(authenticationManager.authenticate(any())).thenReturn(
                new UsernamePasswordAuthenticationToken("joao@empresa.com", "123456")
        );
        when(userRepository.findByEmail(any())).thenReturn(Optional.of(user));
        when(jwtUtil.generateToken(any())).thenReturn("token_fake");

        AuthResponse response = authService.login(loginRequest);

        assertNotNull(response);
        assertEquals("joao@empresa.com", response.getEmail());
        assertEquals("token_fake", response.getToken());
    }
}