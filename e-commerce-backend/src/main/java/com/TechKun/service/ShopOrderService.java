package com.TechKun.service;

import com.TechKun.dto.AddressDTO;
import com.TechKun.model.*;
import com.TechKun.model.enums.OrderStatus;
import com.TechKun.repository.AddressRepository;
import com.TechKun.repository.ShopOrderRepository;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.util.Assert;
import org.springframework.util.StringUtils;

import com.TechKun.dto.order_dtos.*;
import com.TechKun.helper.UpdateManager;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ShopOrderService {
    @Autowired
    private ShopOrderRepository shopOrderRepository;

    @Autowired
    private AddressRepository addressRepository;

    public Page<OrderPreviewDTO> getAllOrders(
            ShopUser loggedInUser, Integer customerId,
            OrderQueryOptions filters, Integer page, Integer size) {
        if (!loggedInUser.isAdmin())
            customerId = loggedInUser.getUserId();
        if (filters == null)
            filters = new OrderQueryOptions();

        return this.shopOrderRepository.getAllOrders(customerId, filters, page, size);
    }

    public OrderDetails getOrderById(ShopUser loggedInUser, Integer shopOrderId) {
        OrderDetails orderDetails = this.shopOrderRepository.getOrderDetails(shopOrderId)
                .orElseThrow(() -> new RuntimeException("Order not found."));
        if (!(loggedInUser.getUserId().equals(orderDetails.getCustomer().getCustomerId()) || loggedInUser.isAdmin()))
            throw new AccessDeniedException("You are not authorized to access this order's details.");

        return orderDetails;
    }

    public ShopOrder createOrder(
            ShopUser loggedInUser,
            OrderCreatePayload payload) {
        Assert.notEmpty(payload.getItems(), "Order items must not be empty.");
        payload.getItems().forEach(item -> {
            Assert.notNull(item, "An order item must not be null.");
            Assert.notNull(item.getShippingMethodId(), "Shipping method ID must not be null.");
            Assert.notNull(item.getProductVariantId(), "An order item's product variant ID must not be null.");
            Assert.notNull(item.getPrice(), "An order item's price must not be null.");
            Assert.isTrue(
                    item.getQuantity() != null && item.getQuantity() > 0,
                    "An order item's quantity must be greater than 0.");
        });
        AddressDTO shippingAddress = payload.getShippingAddress();
        Assert.isTrue(
                payload.getShippingAddressId() != null || shippingAddress != null,
                "Either shipping address ID or the shipping address object must be present.");
        if (shippingAddress != null) {
            Assert.hasText(shippingAddress.getStreet(), "Address line must not be empty.");
            Assert.hasText(shippingAddress.getCity(), "City must not be empty.");
            Assert.hasText(shippingAddress.getCountry(), "Country must not be empty.");
            Assert.notNull(shippingAddress.getPincode(), "Pincode must not be null.");
        }
        Assert.notNull(payload.getPaymentMethodId(), "Payment method ID must not be null.");

        ShopOrder shopOrder = new ShopOrder();
        shopOrder.setCustomer(loggedInUser);
        shopOrder.setOrderItems(payload.getItems().stream()
                .map(item -> {
                    OrderItem orderItem = new OrderItem();
                    orderItem.setShopOrder(shopOrder);
                    orderItem.setPrice(item.getPrice());
                    orderItem.setProductVariant(new ProductVariant(item.getProductVariantId()));
                    orderItem.setShippingMethod(new ShippingMethod(item.getShippingMethodId()));
                    orderItem.setQuantity(item.getQuantity());
                    if (item.getPersonalization() != null)
                        orderItem.setPersonalization(item.getPersonalization());
                    return orderItem;
                })
                .collect(Collectors.toList()));
        if (shippingAddress != null) {
            Address address = new Address();
            address.setStreet(shippingAddress.getStreet());
            address.setCity(shippingAddress.getCity());
            address.setCountry(shippingAddress.getCountry());
            address.setPincode(shippingAddress.getPincode());
            address = addressRepository.save(address);
            shopOrder.setShippingAddress(address);
        } else {
            shopOrder.setShippingAddress(new Address(payload.getShippingAddressId()));
        }
        shopOrder.setPaymentMethod(new PaymentMethod(payload.getPaymentMethodId()));
        shopOrder.setStatus(OrderStatus.PENDING);

        // set financials
        shopOrder.setSubtotalAmount(payload.getSubtotalAmount());
        shopOrder.setShippingAmount(payload.getShippingAmount());
        shopOrder.setTaxAmount(payload.getTaxAmount());
        shopOrder.setDiscountAmount(payload.getDiscountAmount());
        shopOrder.setTotalAmount(payload.getTotalAmount());
        shopOrder.setOrderDate(LocalDateTime.now());

        return this.shopOrderRepository.save(shopOrder);
    }

    public ShopOrder updateOrder(
            ShopUser loggedInUser,
            Integer shopOrderId,
            OrderUpdatePayload payload) {
        if (payload.getItems() != null) {
            Assert.notEmpty(payload.getItems(), "Order items must not be empty.");
            payload.getItems().forEach(item -> {
                Assert.notNull(item, "An order item must not be null.");
                Assert.isTrue(
                        item.getQuantity() == null || item.getQuantity() > 0,
                        "An order item's quantity must be greater than 0.");
            });
        }
        var updateManager = UpdateManager.ofSource(payload);
        updateManager.<Integer>updateConfig("shippingMethodId")
                .targetPropertyName("shippingMethod")
                .mapper(ShippingMethod::new).add();
        updateManager.<Integer>updateConfig("paymentMethodId")
                .targetPropertyName("paymentMethod")
                .mapper(PaymentMethod::new).add();
        updateManager.removeUpdateConfig("items");
        updateManager.removeUpdateConfig("shippingAddressId");
        updateManager.removeUpdateConfig("shippingAddress");

        if (updateManager.nothingToUpdate()
                && payload.getItems() == null
                && payload.getShippingAddressId() == null
                && payload.getShippingAddress() == null)
            throw new IllegalStateException("At least one field must be provided for update.");

        ShopOrder shopOrder = this.shopOrderRepository.findById(shopOrderId)
                .orElseThrow(() -> new RuntimeException("Shop order not found."));
        if (!OrderStatus.PENDING.equals(shopOrder.getStatus()))
            throw new IllegalStateException("Cannot update an order when it is processed.");
        if (loggedInUser.getUserId().equals(shopOrder.getCustomer().getUserId()) || loggedInUser.isAdmin())
            throw new AccessDeniedException("You are not authorized to update this order.");

        updateManager.updateProperties(shopOrder);
        if (payload.getShippingAddress() != null || payload.getShippingAddressId() != null) {
            if (payload.getShippingAddress() != null) {
                AddressDTO shippingAddress = payload.getShippingAddress();
                Address address = new Address();
                if (StringUtils.hasText(shippingAddress.getStreet()))
                    address.setStreet(shippingAddress.getStreet());
                if (StringUtils.hasText(shippingAddress.getCity()))
                    address.setCity(shippingAddress.getCity());
                if (StringUtils.hasText(shippingAddress.getCountry()))
                    address.setCountry(shippingAddress.getCountry());
                if (shippingAddress.getPincode() != null)
                    address.setPincode(shippingAddress.getPincode());
                shopOrder.setShippingAddress(address);
            } else {
                shopOrder.setShippingAddress(new Address(payload.getShippingAddressId()));
            }
        }
        if (payload.getItems() != null) {
            Map<Integer, OrderItem> indexedOrderItems = shopOrder.getOrderItems()
                    .stream()
                    .collect(Collectors.toMap(
                            OrderItem::getOrderItemId,
                            item -> item));
            payload.getItems().forEach(item -> {
                OrderItem orderItem = indexedOrderItems.remove(item.getOrderItemId());
                if (orderItem == null) {
                    shopOrder.getOrderItems().add(orderItem = new OrderItem());
                    orderItem.setShopOrder(shopOrder);
                    Assert.notNull(item.getProductVariantId(), "An order item's product variant ID must not be null.");
                    Assert.notNull(item.getPrice(), "An order item's price must not be null.");
                    Assert.isTrue(
                            item.getQuantity() != null && item.getQuantity() > 0,
                            "An order item's quantity must be greater than 0.");
                }
                if (item.getProductVariantId() != null)
                    orderItem.setProductVariant(new ProductVariant(item.getProductVariantId()));
                if (item.getPrice() != null)
                    orderItem.setPrice(item.getPrice());
                if (item.getQuantity() != null)
                    orderItem.setQuantity(item.getQuantity());
                if (item.getPersonalization() != null)
                    orderItem.setPersonalization(item.getPersonalization());
            });
            indexedOrderItems.values().forEach(shopOrder.getOrderItems()::remove);
        }

        return this.shopOrderRepository.save(shopOrder);
    }
}
