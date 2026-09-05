package com.TechKun.config;

import com.stripe.Stripe;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class StripeConfig {

    @Value("${stripe.api-key}")
    private String apiKey;

    @Value("${stripe.publishable-key}")
    private String publishableKey;

    @Value("${stripe.webhook-secret}")
    private String webhookSecret;

    @PostConstruct
    public void init() {
        Stripe.apiKey = this.apiKey;
    }

    public String getApiKey() {
        return apiKey;
    }

    public String getPublishableKey() {
        return publishableKey;
    }

    public String getWebhookSecret() {
        return webhookSecret;
    }
}
