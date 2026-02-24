package com.zedia.mensageiro.service;

import com.zedia.mensageiro.dto.Dtos.*;
import com.zedia.mensageiro.entity.Template;
import com.zedia.mensageiro.entity.User;
import com.zedia.mensageiro.repository.TemplateRepository;
import com.zedia.mensageiro.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TemplateServiceTest {

    @Mock
    private TemplateRepository templateRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private TemplateService templateService;

    private User user;
    private User outroUser;
    private Template template;
    private TemplateRequest templateRequest;

    @BeforeEach
    void setUp() {
        user = User.builder()
                .id(1L)
                .name("João Silva")
                .email("joao@empresa.com")
                .password("encoded_password")
                .role(User.Role.USER)
                .build();

        outroUser = User.builder()
                .id(2L)
                .name("Maria Silva")
                .email("maria@empresa.com")
                .password("encoded_password")
                .role(User.Role.USER)
                .build();

        template = Template.builder()
                .id(1L)
                .name("Aviso de Manutenção")
                .category(Template.TemplateCategory.AVISO_MANUTENCAO)
                .subject("Sistema {{sistema}} indisponível")
                .body("Olá {{nome}}, o sistema estará fora às {{hora}}.")
                .owner(user)
                .build();

        templateRequest = new TemplateRequest();
        templateRequest.setName("Aviso de Manutenção");
        templateRequest.setCategory(Template.TemplateCategory.AVISO_MANUTENCAO);
        templateRequest.setSubject("Sistema {{sistema}} indisponível");
        templateRequest.setBody("Olá {{nome}}, o sistema estará fora às {{hora}}.");
    }

    @Test
    void deveCriarTemplateComSucesso() {
        when(authentication.getName()).thenReturn("joao@empresa.com");
        when(userRepository.findByEmail("joao@empresa.com")).thenReturn(Optional.of(user));
        when(templateRepository.save(any())).thenReturn(template);

        TemplateResponse response = templateService.create(templateRequest, authentication);

        assertNotNull(response);
        assertEquals("Aviso de Manutenção", response.getName());
        assertEquals("AVISO_MANUTENCAO", response.getCategory());
        verify(templateRepository, times(1)).save(any());
    }

    @Test
    void deveListarMeusTemplates() {
        when(authentication.getName()).thenReturn("joao@empresa.com");
        when(userRepository.findByEmail("joao@empresa.com")).thenReturn(Optional.of(user));
        when(templateRepository.findByOwnerOrderByCreatedAtDesc(user)).thenReturn(List.of(template));

        List<TemplateResponse> templates = templateService.listMine(authentication);

        assertNotNull(templates);
        assertEquals(1, templates.size());
        assertEquals("Aviso de Manutenção", templates.get(0).getName());
    }

    @Test
    void deveAtualizarTemplateComSucesso() {
        when(authentication.getName()).thenReturn("joao@empresa.com");
        when(userRepository.findByEmail("joao@empresa.com")).thenReturn(Optional.of(user));
        when(templateRepository.findById(1L)).thenReturn(Optional.of(template));
        when(templateRepository.save(any())).thenReturn(template);

        TemplateResponse response = templateService.update(1L, templateRequest, authentication);

        assertNotNull(response);
        verify(templateRepository, times(1)).save(any());
    }

    @Test
    void deveLancarExcecaoAoAtualizarTemplateDeOutroUsuario() {
        when(authentication.getName()).thenReturn("joao@empresa.com");
        when(userRepository.findByEmail("joao@empresa.com")).thenReturn(Optional.of(user));
        template.setOwner(outroUser);
        when(templateRepository.findById(1L)).thenReturn(Optional.of(template));

        IllegalStateException exception = assertThrows(
                IllegalStateException.class,
                () -> templateService.update(1L, templateRequest, authentication)
        );

        assertEquals("Sem permissão para editar este template", exception.getMessage());
        verify(templateRepository, never()).save(any());
    }

    @Test
    void deveDeletarTemplateComSucesso() {
        when(authentication.getName()).thenReturn("joao@empresa.com");
        when(userRepository.findByEmail("joao@empresa.com")).thenReturn(Optional.of(user));
        when(templateRepository.findById(1L)).thenReturn(Optional.of(template));

        assertDoesNotThrow(() -> templateService.delete(1L, authentication));

        verify(templateRepository, times(1)).delete(template);
    }

    @Test
    void deveLancarExcecaoAoDeletarTemplateDeOutroUsuario() {
        when(authentication.getName()).thenReturn("joao@empresa.com");
        when(userRepository.findByEmail("joao@empresa.com")).thenReturn(Optional.of(user));
        template.setOwner(outroUser);
        when(templateRepository.findById(1L)).thenReturn(Optional.of(template));

        IllegalStateException exception = assertThrows(
                IllegalStateException.class,
                () -> templateService.delete(1L, authentication)
        );

        assertEquals("Sem permissão para deletar este template", exception.getMessage());
        verify(templateRepository, never()).delete(any());
    }

    @Test
    void deveLancarExcecaoQuandoTemplateNaoEncontrado() {
        when(templateRepository.findById(99L)).thenReturn(Optional.empty());

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> templateService.getById(99L, authentication)
        );

        assertEquals("Template não encontrado", exception.getMessage());
    }
}