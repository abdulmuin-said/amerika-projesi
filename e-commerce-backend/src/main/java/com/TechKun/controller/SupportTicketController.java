package com.TechKun.controller;

import com.TechKun.dto.support_ticket_dtos.*;
import com.TechKun.model.ShopUser;
import com.TechKun.model.SupportTicket;
import com.TechKun.service.SupportTicketService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/support-tickets")
public class SupportTicketController {

    @Autowired
    private SupportTicketService supportTicketService;

    @PostMapping
    public ResponseEntity<SupportTicket> createSupportTicket(
        @AuthenticationPrincipal ShopUser loggedInUser,
        @RequestBody SupportTicketDTO supportTicketDto
    ) {
        return ResponseEntity.ok(this.supportTicketService.createSupportTicket(loggedInUser, supportTicketDto));
    }

    @PutMapping("/{supportTicketId}")
    public ResponseEntity<SupportTicket> updateSupportTicket(
        @PathVariable Integer supportTicketId,
        @RequestBody SupportTicketDTO supportTicketDto
    ) {
        return ResponseEntity.ok(this.supportTicketService.updateSupportTicket(supportTicketId, supportTicketDto.getStatus()));
    }

    @GetMapping
    public ResponseEntity<List<SupportTicketDetails>> getAllSupportTickets(
        @AuthenticationPrincipal ShopUser loggedInUser,
        @RequestParam(required = false) Integer customerId,
        @RequestBody(required = false) SupportTicketQueryOptions queryOptions
    ) {
        return ResponseEntity.ok(this.supportTicketService.getAllSupportTickets(loggedInUser, customerId, queryOptions));
    }
}
