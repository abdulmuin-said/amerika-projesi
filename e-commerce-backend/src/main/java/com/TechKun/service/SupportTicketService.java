package com.TechKun.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import com.TechKun.dto.CustomerContact;
import com.TechKun.model.ShopUser;
import jakarta.persistence.criteria.Predicate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.TechKun.model.SupportTicket;
import com.TechKun.repository.SupportTicketRepository;
import com.TechKun.dto.support_ticket_dtos.*;
import org.springframework.util.Assert;

@Service
public class SupportTicketService {
    @Autowired
    private SupportTicketRepository supportTicketRepository;

    public List<SupportTicketDetails> getAllSupportTickets(
        ShopUser loggedInUser,
        Integer customerId,
        SupportTicketQueryOptions queryOptions
    ) {
        Integer finalCustomerId = loggedInUser.isAdmin() ? customerId : loggedInUser.getUserId();
        List<SupportTicket> supportTickets = this.supportTicketRepository.findAll((root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (finalCustomerId != null)
                predicates.add(cb.equal(root.get("customer").get("userId"), finalCustomerId));
            else if (queryOptions != null && queryOptions.getCustomerName() != null)
                predicates.add(cb.like(root.get("customer").get("fullName"), "%" + queryOptions.getCustomerName() + "%"));
            if (queryOptions != null) {
                if (queryOptions.getStatus() != null)
                    predicates.add(cb.equal(root.get("status"), queryOptions.getStatus()));
                if (queryOptions.getFromDate() != null)
                    predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), queryOptions.getFromDate()));
                if (queryOptions.getToDate() != null)
                    predicates.add(cb.lessThan(root.get("createdAt"), queryOptions.getToDate()));
            }

            return cb.and(predicates.toArray(Predicate[]::new));
        });

        return supportTickets.stream()
            .map(supportTicket -> {
                SupportTicketDetails supportTicketDetails = new SupportTicketDetails();
                supportTicketDetails.setTicketId(supportTicket.getTicketId());
                supportTicketDetails.setStatus(supportTicket.getStatus());
                supportTicketDetails.setSubject(supportTicket.getSubject());
                supportTicketDetails.setDescription(supportTicket.getDescription());
                ShopUser customer = supportTicket.getCustomer();
                CustomerContact customerContact = new CustomerContact();
                customerContact.setCustomerId(customer.getUserId());
                customerContact.setCustomerName(customer.getFullName());
                customerContact.setEmail(customer.getEmail());
                customerContact.setPhoneNumber(customer.getPhoneNo());
                supportTicketDetails.setCustomer(customerContact);
                return supportTicketDetails;
            })
            .collect(Collectors.toList());
    }
    public SupportTicket createSupportTicket(
        ShopUser loggedInUser,
        SupportTicketDTO supportTicketDto
    ) {
        Assert.hasText(supportTicketDto.getSubject(),  "Subject must not be empty.");
        Assert.hasText(supportTicketDto.getDescription(), "Description must not be empty.");
        SupportTicket supportTicket = new SupportTicket();
        supportTicket.setSubject(supportTicketDto.getSubject());
        supportTicket.setDescription(supportTicketDto.getDescription());
        supportTicket.setCreatedAt(LocalDateTime.now());
        supportTicket.setCustomer(loggedInUser);
        supportTicket.setStatus("OPEN");
        return this.supportTicketRepository.save(supportTicket);
    }
    public SupportTicket updateSupportTicket(
        Integer supportTicketId,
        String status
    ) {
        if (status == null)
            throw new IllegalStateException("At least one field must be provided for update.");

        SupportTicket supportTicket = this.supportTicketRepository.findById(supportTicketId)
            .orElseThrow(() -> new RuntimeException("Support ticket not found."));
        supportTicket.setStatus(status);
        return this.supportTicketRepository.save(supportTicket);
    }
}
