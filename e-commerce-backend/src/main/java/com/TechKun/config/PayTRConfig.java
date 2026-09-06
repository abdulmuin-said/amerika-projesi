package com.TechKun.config;

import lombok.Data;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
@Data
public class PayTRConfig {

    @Value("${paytr.merchant-id:}")
    private String merchantId;

    @Value("${paytr.merchant-key:}")
    private String merchantKey;

    @Value("${paytr.merchant-salt:}")
    private String merchantSalt;

    @Value("${paytr.test-mode:1}")
    private String testMode; // "1" for sandbox/test, "0" for production

    @Value("${paytr.callback-url:http://localhost:8080/paytr/callback}")
    private String callbackUrl;

    @Value("${paytr.timeout-limit:30}")
    private String timeoutLimit;

    public boolean isConfigured() {
        return merchantId != null && !merchantId.isBlank()
                && merchantKey != null && !merchantKey.isBlank()
                && merchantSalt != null && !merchantSalt.isBlank();
    }
}
