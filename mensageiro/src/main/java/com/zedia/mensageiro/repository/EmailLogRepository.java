package com.zedia.mensageiro.repository;

import com.zedia.mensageiro.entity.EmailLog;
import com.zedia.mensageiro.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface EmailLogRepository extends JpaRepository<EmailLog, Long> {
    List<EmailLog> findBySenderOrderBySentAtDesc(User sender);
}