package com.TechKun.helper;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.from:NovaCanvas Studios <concierge@novacanvas.com>}")
    private String mailFrom;

    @Async
    public void sendEmailVerificationEmail(String email, String verificationLink) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(mailFrom);
            message.setTo(email);
            message.setSubject("NovaCanvas Studios™ | Verify Your Email Address");
            message.setText("Welcome to NovaCanvas Studios.\n\n"
                    + "Please click the secure link below to verify your email address:\n"
                    + verificationLink + "\n\n"
                    + "If you did not create an account, you can safely disregard this email.\n\n"
                    + "Warm regards,\n"
                    + "NovaCanvas Studios Client Concierge\n"
                    + "Wilmington, DE — USA");

            mailSender.send(message);
            log.info("Verification email successfully sent to {}", email);
        } catch (MailException e) {
            log.error("Failed to send verification email to {}: {}", email, e.getMessage());
        }
    }

    @Async
    public void sendResetPasswordEmail(String email, String resetLink) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(mailFrom);
            message.setTo(email);
            message.setSubject("NovaCanvas Studios™ | Password Reset Request");
            message.setText("Hello,\n\n"
                    + "We received a request to reset the password for your NovaCanvas Studios account.\n\n"
                    + "Click the secure link below to set a new password:\n"
                    + resetLink + "\n\n"
                    + "This link will expire in 24 hours. If you did not request this change, please ignore this email.\n\n"
                    + "Warm regards,\n"
                    + "NovaCanvas Studios Client Concierge\n"
                    + "Wilmington, DE — USA");

            mailSender.send(message);
            log.info("Reset password email successfully sent to {}", email);
        } catch (MailException e) {
            log.error("Failed to send reset password email to {}: {}", email, e.getMessage());
        }
    }
}