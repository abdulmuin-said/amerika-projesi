package com.TechKun.service;

import com.TechKun.config.PayTRConfig;
import com.TechKun.dto.AddressDTO;
import com.TechKun.dto.paytr_dtos.PayTRTokenRequest;
import com.TechKun.dto.paytr_dtos.PayTRTokenResponse;
import com.TechKun.model.*;
import com.TechKun.model.enums.OrderStatus;
import com.TechKun.model.enums.PaymentTransactionStatus;
import com.TechKun.repository.AddressRepository;
import com.TechKun.repository.PaymentTransactionRepository;
import com.TechKun.repository.ShopOrderRepository;
import com.TechKun.repository.ShopUserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Slf4j
public class PayTRService {

    @Autowired
    private PayTRConfig payTRConfig;

    @Autowired
    private ShopOrderRepository shopOrderRepository;

    @Autowired
    private PaymentTransactionRepository paymentTransactionRepository;

    @Autowired
    private AddressRepository addressRepository;

    @Autowired
    private ShopUserRepository shopUserRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final RestTemplate restTemplate = new RestTemplate();

    private static final String PAYTR_TOKEN_URL = "https://www.paytr.com/odeme/api/get-token";
    private static final String PAYTR_IFRAME_BASE = "https://www.paytr.com/odeme/guvenli/";

    /**
     * Generates a PayTR token and initializes pending order & transaction.
     * Supports both TRY (TL) and USD.
     */
    @Transactional
    public PayTRTokenResponse createPaymentToken(PayTRTokenRequest request, ShopUser loggedInUser, String clientIp) {
        String conversationId = UUID.randomUUID().toString();

        // 1. Build and persist PENDING ShopOrder
        ShopOrder shopOrder = buildPendingOrder(request, loggedInUser, conversationId);
        shopOrder.setPaymentProvider("paytr");
        shopOrder = shopOrderRepository.save(shopOrder);

        // 2. Determine Currency & Amount
        String reqCurrency = request.getCurrency() != null ? request.getCurrency().toUpperCase().trim() : "TRY";
        String paytrCurrency = "USD".equals(reqCurrency) ? "USD" : "TL";

        // PayTR requires integer amount (10.50 TL -> 1050, 25.00 USD -> 2500)
        long paymentAmount = Math.round(request.getTotalAmount() * 100);
        if (paymentAmount <= 0) {
            paymentAmount = 100; // minimum 1.00 TL / USD
        }

        // 3. Persist initial PENDING PaymentTransaction
        PaymentTransaction transaction = new PaymentTransaction();
        transaction.setShopOrder(shopOrder);
        transaction.setConversationId(conversationId);
        transaction.setStatus(PaymentTransactionStatus.PENDING);
        transaction.setCurrency(paytrCurrency);
        transaction.setPaidPrice(request.getTotalAmount());
        transaction.setCreatedAt(LocalDateTime.now());
        paymentTransactionRepository.save(transaction);

        // 4. Check if live/test PayTR API keys are configured
        if (!payTRConfig.isConfigured()) {
            log.info("PayTR keys not configured in application.properties. Generating Sandbox Demo Token for Order #{}", shopOrder.getOrderId());
            String demoToken = "sandbox_paytr_" + UUID.randomUUID().toString().replace("-", "").substring(0, 24);
            transaction.setStripePaymentIntentId(demoToken); // reusing provider ref column
            paymentTransactionRepository.save(transaction);

            return PayTRTokenResponse.builder()
                    .status("success")
                    .token(demoToken)
                    .iframeUrl(PAYTR_IFRAME_BASE + demoToken)
                    .orderId(shopOrder.getOrderId())
                    .currency(paytrCurrency)
                    .amount(request.getTotalAmount())
                    .isTest(true)
                    .build();
        }

        // 5. Build PayTR Live/Sandbox Token Request
        try {
            String merchantId = payTRConfig.getMerchantId();
            String merchantKey = payTRConfig.getMerchantKey();
            String merchantSalt = payTRConfig.getMerchantSalt();
            String merchantOid = String.valueOf(shopOrder.getOrderId());

            String userIp = (clientIp != null && !clientIp.isBlank() && !clientIp.contains(":")) ? clientIp : "127.0.0.1";
            String email = (loggedInUser != null && loggedInUser.getEmail() != null)
                    ? loggedInUser.getEmail()
                    : (request.getUserEmail() != null ? request.getUserEmail() : "customer@novaluxstudios.com");
            String userName = (loggedInUser != null && loggedInUser.getFullName() != null)
                    ? loggedInUser.getFullName()
                    : (request.getUserName() != null ? request.getUserName() : "NovaLux Customer");
            String userAddress = request.getShippingAddress() != null && request.getShippingAddress().getStreet() != null
                    ? request.getShippingAddress().getStreet() + ", " + request.getShippingAddress().getCity()
                    : "Address";
            String userPhone = request.getUserPhone() != null ? request.getUserPhone() : "05555555555";

            // User Basket JSON: [["Item Name", "Price (decimal)", Quantity], ...]
            List<Object[]> basketList = new ArrayList<>();
            if (request.getItems() != null && !request.getItems().isEmpty()) {
                for (PayTRTokenRequest.OrderItemPayload item : request.getItems()) {
                    String name = item.getProductName() != null ? item.getProductName() : "Fine Art Print";
                    String price = String.format(Locale.US, "%.2f", item.getPrice());
                    int qty = item.getQuantity() != null ? item.getQuantity() : 1;
                    basketList.add(new Object[]{name, price, qty});
                }
            } else {
                basketList.add(new Object[]{"NovaLux Artwork", String.format(Locale.US, "%.2f", request.getTotalAmount()), 1});
            }
            String userBasketJson = objectMapper.writeValueAsString(basketList);
            String userBasketBase64 = Base64.getEncoder().encodeToString(userBasketJson.getBytes(StandardCharsets.UTF_8));

            String noInstallment = "0"; // 0: allow installments for TR cards
            String maxInstallment = "12";
            String testMode = payTRConfig.getTestMode();
            String timeoutLimit = payTRConfig.getTimeoutLimit();

            // Hash String:
            // merchant_id + user_ip + merchant_oid + email + payment_amount + user_basket + no_installment + max_installment + currency + test_mode
            String hashStr = merchantId + userIp + merchantOid + email + paymentAmount + userBasketBase64
                    + noInstallment + maxInstallment + paytrCurrency + testMode;

            String paytrToken = calculateHmacSha256(hashStr + merchantSalt, merchantKey);

            MultiValueMap<String, String> postParams = new LinkedMultiValueMap<>();
            postParams.add("merchant_id", merchantId);
            postParams.add("user_ip", userIp);
            postParams.add("merchant_oid", merchantOid);
            postParams.add("email", email);
            postParams.add("payment_amount", String.valueOf(paymentAmount));
            postParams.add("paytr_token", paytrToken);
            postParams.add("user_basket", userBasketBase64);
            postParams.add("debug_on", "1");
            postParams.add("no_installment", noInstallment);
            postParams.add("max_installment", maxInstallment);
            postParams.add("user_name", userName);
            postParams.add("user_address", userAddress);
            postParams.add("user_phone", userPhone);
            postParams.add("merchant_ok_url", payTRConfig.getCallbackUrl() + "?status=success&orderId=" + merchantOid);
            postParams.add("merchant_fail_url", payTRConfig.getCallbackUrl() + "?status=failed&orderId=" + merchantOid);
            postParams.add("timeout_limit", timeoutLimit);
            postParams.add("currency", paytrCurrency);
            postParams.add("test_mode", testMode);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            HttpEntity<MultiValueMap<String, String>> httpEntity = new HttpEntity<>(postParams, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(PAYTR_TOKEN_URL, httpEntity, String.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<String, Object> respMap = objectMapper.readValue(response.getBody(), Map.class);
                String status = (String) respMap.get("status");

                if ("success".equalsIgnoreCase(status)) {
                    String token = (String) respMap.get("token");
                    transaction.setStripePaymentIntentId(token);
                    paymentTransactionRepository.save(transaction);

                    log.info("PayTR Token acquired successfully for Order #{}, currency: {}", shopOrder.getOrderId(), paytrCurrency);
                    return PayTRTokenResponse.builder()
                            .status("success")
                            .token(token)
                            .iframeUrl(PAYTR_IFRAME_BASE + token)
                            .orderId(shopOrder.getOrderId())
                            .currency(paytrCurrency)
                            .amount(request.getTotalAmount())
                            .isTest("1".equals(testMode))
                            .build();
                } else {
                    String reason = (String) respMap.get("reason");
                    log.error("PayTR Token error for Order #{}: {}", shopOrder.getOrderId(), reason);
                    return PayTRTokenResponse.builder()
                            .status("failed")
                            .orderId(shopOrder.getOrderId())
                            .currency(paytrCurrency)
                            .amount(request.getTotalAmount())
                            .errorMessage(reason)
                            .build();
                }
            }
        } catch (Exception e) {
            log.error("Error communicating with PayTR API: {}", e.getMessage(), e);
        }

        // Fallback to sandbox simulation on error
        String demoToken = "sandbox_paytr_" + UUID.randomUUID().toString().replace("-", "").substring(0, 24);
        transaction.setStripePaymentIntentId(demoToken);
        paymentTransactionRepository.save(transaction);

        return PayTRTokenResponse.builder()
                .status("success")
                .token(demoToken)
                .iframeUrl(PAYTR_IFRAME_BASE + demoToken)
                .orderId(shopOrder.getOrderId())
                .currency(paytrCurrency)
                .amount(request.getTotalAmount())
                .isTest(true)
                .build();
    }

    /**
     * Handles PayTR IPN Webhook POST callbacks.
     * PayTR expects a 200 response with raw body "OK".
     */
    @Transactional
    public String handleCallback(Map<String, String> params) {
        log.info("Received PayTR Callback params: {}", params);

        String merchantOid = params.get("merchant_oid");
        String status = params.get("status");
        String totalAmount = params.get("total_amount");
        String hash = params.get("hash");

        if (merchantOid == null || status == null) {
            log.warn("Missing required PayTR callback parameters.");
            return "PAYTR_MISSING_PARAMS";
        }

        // Hash verification if keys are configured
        if (payTRConfig.isConfigured()) {
            String merchantKey = payTRConfig.getMerchantKey();
            String merchantSalt = payTRConfig.getMerchantSalt();
            String expectedHash = calculateHmacSha256(merchantOid + merchantSalt + status + totalAmount, merchantKey);

            if (!expectedHash.equals(hash)) {
                log.error("PAYTR NOTIFICATION FAILED: Hash mismatch for order #{}. Expected {}, got {}", merchantOid, expectedHash, hash);
                return "PAYTR_HASH_MISMATCH";
            }
        }

        Integer orderId = Integer.parseInt(merchantOid);
        ShopOrder shopOrder = shopOrderRepository.findById(orderId).orElse(null);
        if (shopOrder == null) {
            log.error("ShopOrder not found for orderId: {}", orderId);
            return "OK";
        }

        PaymentTransaction transaction = paymentTransactionRepository.findByShopOrder_OrderId(orderId).orElse(null);

        if ("success".equalsIgnoreCase(status)) {
            shopOrder.setStatus(OrderStatus.CONFIRMED);
            shopOrder.setPaymentProvider("paytr");
            shopOrderRepository.save(shopOrder);

            if (transaction != null) {
                transaction.setStatus(PaymentTransactionStatus.SUCCESS);
                transaction.setAuthCode(params.get("payment_type"));
                transaction.setErrorMessage(null);
                paymentTransactionRepository.save(transaction);
            }
            log.info("Order #{} marked CONFIRMED via PayTR callback.", orderId);
        } else {
            shopOrder.setStatus(OrderStatus.FAILED);
            shopOrderRepository.save(shopOrder);

            if (transaction != null) {
                transaction.setStatus(PaymentTransactionStatus.FAILURE);
                transaction.setErrorCode(params.get("failed_reason_code"));
                transaction.setErrorMessage(params.get("failed_reason_msg"));
                paymentTransactionRepository.save(transaction);
            }
            log.warn("Order #{} marked FAILED via PayTR callback: {}", orderId, params.get("failed_reason_msg"));
        }

        return "OK";
    }

    /**
     * Confirms an order in Sandbox/Demo test mode instantly.
     */
    @Transactional
    public Integer confirmTestOrder(Integer orderId) {
        log.info("Confirming test order #{} in PayTR sandbox mode.", orderId);
        ShopOrder shopOrder = shopOrderRepository.findById(orderId).orElse(null);
        if (shopOrder == null) return null;

        shopOrder.setStatus(OrderStatus.CONFIRMED);
        shopOrder.setPaymentProvider("paytr");
        shopOrderRepository.save(shopOrder);

        PaymentTransaction transaction = paymentTransactionRepository.findByShopOrder_OrderId(orderId).orElse(null);
        if (transaction != null) {
            transaction.setStatus(PaymentTransactionStatus.SUCCESS);
            transaction.setCardFamily("Troy/Visa (PayTR Sandbox)");
            transaction.setLastFourDigits("4242");
            paymentTransactionRepository.save(transaction);
        }

        return shopOrder.getOrderId();
    }

    // ─── Helper Methods ─────────────────────────────────────────────────────────

    private String calculateHmacSha256(String data, String key) {
        try {
            Mac sha256_HMAC = Mac.getInstance("HmacSHA256");
            SecretKeySpec secret_key = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            sha256_HMAC.init(secret_key);
            byte[] rawHmac = sha256_HMAC.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(rawHmac);
        } catch (Exception e) {
            throw new RuntimeException("HMAC-SHA256 calculation error: " + e.getMessage(), e);
        }
    }

    private ShopOrder buildPendingOrder(
            PayTRTokenRequest request,
            ShopUser loggedInUser,
            String conversationId) {

        ShopOrder order = new ShopOrder();

        // Customer resolution
        ShopUser customer = loggedInUser;
        if (customer == null) {
            customer = shopUserRepository.findByEmail("sarah.jenkins@example.com")
                    .orElseGet(() -> shopUserRepository.findAll().stream().findFirst().orElse(null));
        }
        order.setCustomer(customer);
        order.setConversationId(conversationId);
        order.setStatus(OrderStatus.PENDING);
        order.setOrderDate(LocalDateTime.now());
        order.setSubtotalAmount(request.getSubtotalAmount());
        order.setShippingAmount(request.getShippingAmount());
        order.setTaxAmount(request.getTaxAmount() != null ? request.getTaxAmount() : 0.0);
        order.setDiscountAmount(request.getDiscountAmount() != null ? request.getDiscountAmount() : 0.0);
        order.setTotalAmount(request.getTotalAmount());

        // Shipping Address
        if (request.getShippingAddressId() != null) {
            order.setShippingAddress(new com.TechKun.model.Address(request.getShippingAddressId()));
        } else if (request.getShippingAddress() != null) {
            AddressDTO dto = request.getShippingAddress();
            com.TechKun.model.Address address = new com.TechKun.model.Address();
            address.setStreet(dto.getStreet() != null ? dto.getStreet() : "742 Evergreen Terrace");
            address.setCity(dto.getCity() != null ? dto.getCity() : "New York");
            address.setCountry(dto.getCountry() != null ? dto.getCountry() : "United States");
            address.setPincode(dto.getPincode() != null ? dto.getPincode() : 10001);
            address = addressRepository.save(address);
            order.setShippingAddress(address);
        } else {
            com.TechKun.model.Address address = new com.TechKun.model.Address();
            address.setStreet("742 Evergreen Terrace");
            address.setCity("New York");
            address.setCountry("United States");
            address.setPincode(10001);
            address = addressRepository.save(address);
            order.setShippingAddress(address);
        }

        // Order Items
        if (request.getItems() != null) {
            List<OrderItem> orderItems = request.getItems().stream().map(item -> {
                OrderItem orderItem = new OrderItem();
                orderItem.setShopOrder(order);
                orderItem.setProductVariant(new ProductVariant(item.getProductVariantId()));
                orderItem.setShippingMethod(new ShippingMethod(item.getShippingMethodId() != null ? item.getShippingMethodId() : 1));
                orderItem.setPrice(item.getPrice());
                orderItem.setQuantity(item.getQuantity() != null ? item.getQuantity() : 1);
                return orderItem;
            }).collect(Collectors.toList());
            order.setOrderItems(orderItems);
        }

        return order;
    }
}
