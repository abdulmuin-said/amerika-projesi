package com.TechKun.helper;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.Arrays;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Async
    public void sendEmailVerificationEmail(String email, String verificationLink) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setSubject("Verify your email address");
        message.setText("Click the following link to verify your email: " + verificationLink);

        mailSender.send(message);
    }

    @Async
    public void sendResetPasswordEmail(String email, String resetLink) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("naved@tech-kun.com");
            message.setTo(email);
            message.setSubject("Reset Password");
            message.setText("Click the following link to reset your password: " + resetLink);
            mailSender.send(message);
            System.out.println("Reset password mail sent.");
        } catch (MailException e) {
            System.out.println(Arrays.toString(e.getStackTrace()));
        }
        System.out.println("Method executed.");
    }
}