package com.TechKun.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DatabaseMigrationConfig {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    /**
     * Drops the NOT NULL constraint on payment_method_id in ShopOrder.
     * Safe to run on every startup — if already nullable, DB ignores it silently.
     *
     * Reason: Stripe flow stores payment details in PaymentTransaction,
     * so ShopOrder no longer needs payment_method_id to be mandatory.
     */
    @EventListener(ApplicationReadyEvent.class)
    public void makePaymentMethodNullable() {
        try {
            jdbcTemplate.execute(
                "ALTER TABLE \"ShopOrder\" ALTER COLUMN payment_method_id DROP NOT NULL"
            );
        } catch (Exception ignored) {
            // Already nullable — nothing to do
        }
    }
}
