package com.TechKun.repository;

import com.TechKun.dao.CartItemRepositoryExtension;
import com.TechKun.model.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface CartItemRepository extends JpaRepository<CartItem, Integer>, CartItemRepositoryExtension {
    List<CartItem> findByAddedAtBefore(LocalDateTime dateTime);
}
