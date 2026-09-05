package com.TechKun.service;

import com.TechKun.dto.AddressDTO;
import com.TechKun.dto.UserEssentials;
import com.TechKun.helper.EmailService;
import com.TechKun.helper.PhoneNumberUtils;
import com.TechKun.jwt.JwtUtils;
import com.TechKun.model.Address;
import com.TechKun.model.Role;
import com.TechKun.model.ShopUser;
import com.TechKun.repository.ShopUserRepository;
import com.google.i18n.phonenumbers.NumberParseException;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.impl.DefaultClaims;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.TechKun.dto.auth_dtos.*;

import org.springframework.util.Assert;
import java.util.*;
import java.util.regex.Pattern;

@Service
public class AuthService {
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ShopUserRepository shopUserRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private AuthenticationManager authManager;

    @Autowired
    private JwtUtils jwtUtil;

    @Autowired
    private UserDetailsService userDetailsService;

    public ShopUser register(RegistrationPayload payload) {
        Assert.notNull(payload, "Payload must not be null.");
        Assert.hasText(payload.getFullName(), "Name must not be empty.");
        Assert.hasText(payload.getEmail(), "Email must not be empty.");
        Pattern emailRegex = Pattern.compile(
                "^[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,6}$",
                Pattern.CASE_INSENSITIVE);
        Assert.isTrue(emailRegex.matcher(payload.getEmail()).matches(), "Email must be valid.");
        Assert.hasText(payload.getPassword(), "Password must not be empty.");
        Assert.notNull(payload.getRoleId(), "Role ID must not be null.");

        if (this.shopUserRepository.existsByEmail(payload.getEmail()))
            throw new IllegalStateException("Email already exists.");

        ShopUser shopUser = new ShopUser();
        shopUser.setFullName(payload.getFullName());
        shopUser.setEmail(payload.getEmail().toLowerCase());

        // String jwtToken = this.jwtUtil.generateToken(payload.getEmail());
        // String verificationLink = "http://localhost:3000/verify-email?token=" +
        // jwtToken;
        // this.emailService.sendEmailVerificationEmail(payload.getEmail(),
        // verificationLink);
        try {
            if (PhoneNumberUtils.isValidPhoneNumber(payload.getPhoneNo()))
                shopUser.setPhoneNo(PhoneNumberUtils.formatPhoneNumber(payload.getPhoneNo()));
            else
                throw new IllegalArgumentException("Phone number is not valid.");
        } catch (NumberParseException e) {
            throw new IllegalArgumentException("Error while parsing phone number: " + e.getMessage());
        }
        shopUser.setPassword(passwordEncoder.encode(payload.getPassword()));

        AddressDTO addressDto = payload.getAddress();
        if (Objects.nonNull(addressDto)
            && !addressDto.getCity().isBlank()
            && !addressDto.getCountry().isBlank()
            && addressDto.getPincode() > 0
        ) {
            Address address = new Address();
            address.setStreet(addressDto.getStreet());
            address.setCity(addressDto.getCity());
            address.setPincode(addressDto.getPincode());
            address.setCountry(addressDto.getCountry());
            shopUser.setAddress(address);
        }

        Role role = new Role();
        role.setRoleId(payload.getRoleId());
        shopUser.setRole(role);
        return this.shopUserRepository.save(shopUser);
    }

    public TokenPayload login(LoginPayload payload) {
        Assert.hasText(payload.getEmail(), "Email must not be empty.");
        Assert.hasText(payload.getPassword(), "Password must not be empty.");
        authManager.authenticate(new UsernamePasswordAuthenticationToken(
                payload.getEmail(), payload.getPassword()));

        UserDetails userDetails = userDetailsService.loadUserByUsername(payload.getEmail());
        JwtUtils.JwtToken token = jwtUtil.generateToken(userDetails.getUsername());

        return new TokenPayload(
            "Successfully logged in.",
            token.getToken(),
            token.getExpiresAt(),
            getUserEssentials((ShopUser) userDetails)
        );
    }

    public UserEssentials getUserEssentials(ShopUser loggedInUser) {
        if (loggedInUser == null)
            throw new IllegalStateException("You're not logged in.");

        UserEssentials userEssentials = new UserEssentials();
        userEssentials.setUserId(loggedInUser.getUserId());
        userEssentials.setEmail(loggedInUser.getEmail());
        userEssentials.setFullName(loggedInUser.getFullName());
        userEssentials.setPhoneNo(loggedInUser.getPhoneNo());
        userEssentials.setJoinedAt(loggedInUser.getJoinedAt());
        userEssentials.setAddress(loggedInUser.getAddress());
        userEssentials.setRoleId(loggedInUser.getRole().getRoleId());
        userEssentials.setRoleName(loggedInUser.getRole().getName());
        return userEssentials;
    }

    public Map<String, Object> forgotPassword(ForgotPasswordPayload payload) {
        Assert.hasText(payload.getEmail(), "Email must not be empty.");
        Optional<ShopUser> userOptional = this.shopUserRepository.findByEmail(payload.getEmail());
        if (userOptional.isEmpty())
            throw new IllegalArgumentException("User not found.");

        ShopUser user = userOptional.get();
        Claims claims = new DefaultClaims(Map.of("userId", user.getUserId()));

        JwtUtils.JwtToken jwtToken = this.jwtUtil.generateToken(user.getEmail(), claims);

        String resetLink = "http://localhost:3000/auth/reset-password?token=" + jwtToken.getToken();
        emailService.sendResetPasswordEmail(user.getEmail(), resetLink);

        return Map.of(
                "message", "Reset password email sent.",
                "expiresIn", JwtUtils.EXPIRATION_TIME);
    }

    public Map<String, Object> resetPassword(ResetPasswordPayload payload) {
        Assert.hasText(payload.getToken(), "Token must not be empty.");
        Assert.hasText(payload.getNewPassword(), "New password must not be empty.");
        String token = payload.getToken();
        Jws<Claims> jws = this.jwtUtil.parseToken(token);
        if (Objects.isNull(jws))
            throw new IllegalArgumentException("Invalid or expired token.");

        Claims claims = jws.getPayload();
        Date expiration = claims.getExpiration();
        if (new Date().after(expiration))
            throw new IllegalArgumentException("The reset token has expired");

        Integer userId = claims.get("userId", Integer.class);
        Optional<ShopUser> userOptional = shopUserRepository.findById(userId);
        if (userOptional.isEmpty())
            throw new IllegalArgumentException("User not found.");

        ShopUser user = userOptional.get();
        user.setPassword(passwordEncoder.encode(payload.getNewPassword()));
        shopUserRepository.save(user);

        return Map.of("message", "Password has been reset successfully.");
    }

    public Map<String, Object> changePassword(ShopUser loggedInUser, ChangePasswordPayload payload) {
        Assert.hasText(payload.getCurrentPassword(), "Current password must not be empty.");
        Assert.hasText(payload.getNewPassword(), "New password must not be empty.");
        if (!passwordEncoder.matches(payload.getCurrentPassword(), loggedInUser.getPassword()))
            throw new IllegalArgumentException("The entered current password is incorrect.");

        loggedInUser.setPassword(passwordEncoder.encode(payload.getNewPassword()));
        this.shopUserRepository.save(loggedInUser);
        return Map.of("message", "Password changed successfully.");
    }

    public Map<String, Object> deleteAccount(ShopUser loggedInUser, DeleteAccountPayload payload) {
        Assert.hasText(payload.getPassword(), "Password must not be empty.");
        if (loggedInUser.getRemoved())
            throw new IllegalStateException("User is already deleted");
        if (!passwordEncoder.matches(payload.getPassword(), loggedInUser.getPassword()))
            throw new IllegalArgumentException("Incorrect password.");

        loggedInUser.setRemoved(true);
        this.shopUserRepository.save(loggedInUser);
        return Map.of("message", "Account has been deleted successfully.");
    }
}
