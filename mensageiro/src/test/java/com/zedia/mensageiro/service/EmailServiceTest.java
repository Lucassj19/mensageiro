package com.zedia.mensageiro.service;

import com.zedia.mensageiro.dto.Dtos.*;
import com.zedia.mensageiro.entity.EmailLog;
import com.zedia.mensageiro.entity.Template;
import com.zedia.mensageiro.entity.User;
import com.zedia.mensageiro.repository.EmailLogRepository;
import com.zedia.mensageiro.repository.TemplateRepository;
import com.zedia.mensageiro.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.core.Authentication;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmailServiceTest {

    @Mock
    private JavaMailSender mailSender;

    @Mock
    private TemplateRepository templateRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private EmailLogRepository emailLogRepository;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private EmailService emailService;

    private User sender;
    private User recipient;
    private Template template;
    private SendEmailRequest sendEmailRequest;
    private EmailLog emailLog;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(emailService, "fromEmail", "noreply@mensageiro.com");

        sender = User.builder()
                .id(1L)
                .name("João Silva")
                .email("joao@empresa.com")
                .password("encoded_password")
                .role(User.Role.USER)
                .build();

        recipient = User.builder()
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
                .owner(sender)
                .build();

        sendEmailRequest = new SendEmailRequest();
        sendEmailRequest.setTemplateId(1L);
        sendEmailRequest.setRecipientEmails(List.of("maria@empresa.com"));
        sendEmailRequest.setVariables(java.util.Map.of(
                "sistema", "ERP",
                "nome", "Maria",
                "hora", "22:00"
        ));

        emailLog = EmailLog.builder()
                .id(1L)
                .sender(sender)
                .template(template)
                .subject("Sistema ERP indisponível")
                .body("Olá Maria, o sistema estará fora às 22:00.")
                .recipients(List.of("maria@empresa.com"))
                .status(EmailLog.EmailStatus.SENT)
                .build();

        when(authentication.getName()).thenReturn("joao@empresa.com");
        when(userRepository.findByEmail("joao@empresa.com")).thenReturn(Optional.of(sender));
    }

    @Test
    void deveEnviarEmailComSucesso() {
        when(templateRepository.findById(1L)).thenReturn(Optional.of(template));
        when(userRepository.existsByEmail("maria@empresa.com")).thenReturn(true);
        when(emailLogRepository.save(any())).thenReturn(emailLog);
        doNothing().when(mailSender).send(any(SimpleMailMessage.class));

        EmailLogResponse response = emailService.sendEmail(sendEmailRequest, authentication);

        assertNotNull(response);
        assertEquals("Sistema ERP indisponível", response.getSubject());
        assertEquals("SENT", response.getStatus());
        verify(mailSender, times(1)).send(any(SimpleMailMessage.class));
        verify(emailLogRepository, times(1)).save(any());
    }

    @Test
    void deveRegistrarFalhaQuandoSmtpIndisponivel() {
        when(templateRepository.findById(1L)).thenReturn(Optional.of(template));
        when(userRepository.existsByEmail("maria@empresa.com")).thenReturn(true);
        when(emailLogRepository.save(any())).thenReturn(
                EmailLog.builder()
                        .id(1L).sender(sender).template(template)
                        .subject("Sistema ERP indisponível")
                        .body("Olá Maria, o sistema estará fora às 22:00.")
                        .recipients(List.of("maria@empresa.com"))
                        .status(EmailLog.EmailStatus.FAILED)
                        .build()
        );
        doThrow(new RuntimeException("SMTP indisponível")).when(mailSender).send(any(SimpleMailMessage.class));

        EmailLogResponse response = emailService.sendEmail(sendEmailRequest, authentication);

        assertNotNull(response);
        assertEquals("FAILED", response.getStatus());
        verify(emailLogRepository, times(1)).save(any());
    }

    @Test
    void deveLancarExcecaoQuandoDestinatarioNaoCadastrado() {
        when(templateRepository.findById(1L)).thenReturn(Optional.of(template));
        when(userRepository.existsByEmail("maria@empresa.com")).thenReturn(false);

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> emailService.sendEmail(sendEmailRequest, authentication)
        );

        assertEquals("Usuário não encontrado: maria@empresa.com", exception.getMessage());
        verify(mailSender, never()).send(any(SimpleMailMessage.class));
    }

    @Test
    void deveLancarExcecaoQuandoTemplateNaoEncontrado() {
        when(templateRepository.findById(99L)).thenReturn(Optional.empty());
        sendEmailRequest.setTemplateId(99L);

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> emailService.sendEmail(sendEmailRequest, authentication)
        );

        assertEquals("Template não encontrado", exception.getMessage());
        verify(mailSender, never()).send(any(SimpleMailMessage.class));
    }

    @Test
    void deveListarHistoricoDeEnvios() {
        when(userRepository.findByEmail("joao@empresa.com")).thenReturn(Optional.of(sender));
        when(emailLogRepository.findBySenderOrderBySentAtDesc(sender)).thenReturn(List.of(emailLog));

        List<EmailLogResponse> history = emailService.getHistory(authentication);

        assertNotNull(history);
        assertEquals(1, history.size());
        assertEquals("Sistema ERP indisponível", history.get(0).getSubject());
    }

    @Test
    void deveResolverVariaveisNoTemplate() {
        when(templateRepository.findById(1L)).thenReturn(Optional.of(template));
        when(userRepository.existsByEmail("maria@empresa.com")).thenReturn(true);
        when(emailLogRepository.save(any())).thenAnswer(inv -> {
            EmailLog log = inv.getArgument(0);
            log.setStatus(EmailLog.EmailStatus.SENT);
            return log;
        });
        doNothing().when(mailSender).send(any(SimpleMailMessage.class));

        EmailLogResponse response = emailService.sendEmail(sendEmailRequest, authentication);

        assertNotNull(response);
        assertTrue(response.getSubject().contains("ERP"));
        assertTrue(response.getBody().contains("Maria"));
        assertTrue(response.getBody().contains("22:00"));
    }
}