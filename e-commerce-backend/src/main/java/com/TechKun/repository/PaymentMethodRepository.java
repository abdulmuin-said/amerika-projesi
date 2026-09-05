package com.TechKun.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.TechKun.model.PaymentMethod;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

public interface PaymentMethodRepository
                    extends JpaRepository<PaymentMethod, Integer>, JpaSpecificationExecutor<PaymentMethod> {
          @Modifying
          @Transactional
          @Query("UPDATE PaymentMethod pm SET pm.isDefault = false WHERE pm.user.id = :userId AND pm.isDefault = true")
          void clearDefaultForUser(@Param("userId") Integer userId);
}
