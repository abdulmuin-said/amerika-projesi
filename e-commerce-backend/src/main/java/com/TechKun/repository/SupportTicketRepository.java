package com.TechKun.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.TechKun.model.SupportTicket;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface SupportTicketRepository extends JpaRepository<SupportTicket, Integer>, JpaSpecificationExecutor<SupportTicket> {
}
