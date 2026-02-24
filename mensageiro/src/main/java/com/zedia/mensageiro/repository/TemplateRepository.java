package com.zedia.mensageiro.repository;

import com.zedia.mensageiro.entity.Template;
import com.zedia.mensageiro.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TemplateRepository extends JpaRepository<Template, Long> {
    List<Template> findByOwner(User owner);
    List<Template> findByOwnerOrderByCreatedAtDesc(User owner);
    List<Template> findByCategory(Template.TemplateCategory category);
}