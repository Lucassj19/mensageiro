package com.zedia.mensageiro.service;

import com.zedia.mensageiro.dto.Dtos.*;
import com.zedia.mensageiro.entity.Template;
import com.zedia.mensageiro.entity.User;
import com.zedia.mensageiro.repository.TemplateRepository;
import com.zedia.mensageiro.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TemplateService {

    private final TemplateRepository templateRepository;
    private final UserRepository userRepository;

    public TemplateResponse create(TemplateRequest request, Authentication auth) {
        User user = getUser(auth);
        Template template = Template.builder()
                .name(request.getName())
                .category(request.getCategory())
                .subject(request.getSubject())
                .body(request.getBody())
                .owner(user)
                .build();
        return TemplateResponse.from(templateRepository.save(template));
    }

    public List<TemplateResponse> listMine(Authentication auth) {
        User user = getUser(auth);
        return templateRepository.findByOwnerOrderByCreatedAtDesc(user)
                .stream().map(TemplateResponse::from).collect(Collectors.toList());
    }

    public List<TemplateResponse> listAll() {
        return templateRepository.findAll()
                .stream().map(TemplateResponse::from).collect(Collectors.toList());
    }

    public TemplateResponse getById(Long id, Authentication auth) {
        Template t = templateRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Template não encontrado"));
        return TemplateResponse.from(t);
    }

    public TemplateResponse update(Long id, TemplateRequest request, Authentication auth) {
        User user = getUser(auth);
        Template t = templateRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Template não encontrado"));
        if (!t.getOwner().getId().equals(user.getId())) {
            throw new IllegalStateException("Sem permissão para editar este template");
        }
        t.setName(request.getName());
        t.setCategory(request.getCategory());
        t.setSubject(request.getSubject());
        t.setBody(request.getBody());
        return TemplateResponse.from(templateRepository.save(t));
    }

    public void delete(Long id, Authentication auth) {
        User user = getUser(auth);
        Template t = templateRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Template não encontrado"));
        if (!t.getOwner().getId().equals(user.getId())) {
            throw new IllegalStateException("Sem permissão para deletar este template");
        }
        templateRepository.delete(t);
    }

    private User getUser(Authentication auth) {
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado"));
    }
}