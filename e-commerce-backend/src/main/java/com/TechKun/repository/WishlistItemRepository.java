package com.TechKun.repository;

import com.TechKun.dao.WishlistItemRepositoryExtension;
import org.springframework.data.jpa.repository.JpaRepository;
import com.TechKun.model.WishlistItem;

public interface WishlistItemRepository extends JpaRepository<WishlistItem, Integer>, WishlistItemRepositoryExtension {
}
