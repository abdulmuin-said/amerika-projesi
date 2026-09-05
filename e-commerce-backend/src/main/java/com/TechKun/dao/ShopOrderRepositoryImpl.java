package com.TechKun.dao;

import java.sql.Date;
import java.sql.Timestamp;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import com.TechKun.dto.CustomerContact;
import com.TechKun.dto.order_dtos.OrderDetails;
import com.TechKun.dto.order_dtos.OrderPreviewDTO;
import com.TechKun.dto.order_dtos.OrderQueryOptions;
import com.TechKun.model.Address;
import com.TechKun.model.OrderItem;
import com.TechKun.model.PaymentMethod;
import com.TechKun.model.Personalization;
import com.TechKun.model.Product;
import com.TechKun.model.ProductVariant;
import com.TechKun.model.ShippingMethod;
import com.TechKun.model.enums.OrderStatus;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.persistence.EntityManager;

@Repository
public class ShopOrderRepositoryImpl implements ShopOrderRepositoryExtension {
    @Autowired
    private EntityManager em;
    @Autowired
    private ObjectMapper mapper;

    @Override
    public Page<OrderPreviewDTO> getAllOrders(
            Integer customerId, OrderQueryOptions filters, Integer page, Integer size) {
        String nativeQuery = """
                    WITH filtered_orders AS (
                        SELECT *
                        FROM shop_order
                        WHERE (CAST(:customerId AS INTEGER) IS NULL OR customer_id = CAST(:customerId AS INTEGER))
                        AND (CAST(:statuses AS BOOLEAN) IS NULL OR status = ANY(CAST(:statuses AS TEXT[])))
                        AND (CAST(:fromDate AS DATE) IS NULL OR order_date >= CAST(:fromDate AS DATE))
                        AND (CAST(:toDate AS DATE) IS NULL OR order_date <= CAST(:toDate AS DATE))
                        AND (COALESCE(TRIM(CAST(:trackingNumber AS TEXT)), '') = '' OR tracking_number ILIKE CONCAT('%', CAST(:trackingNumber AS TEXT), '%'))
                    ),
                    ordered_items AS (
                        SELECT order_id,
                            SUM(price) AS total_price
                        FROM order_item
                        GROUP BY order_id
                    )
                    SELECT
                        o.order_id,
                        o.order_date,
                        o.status,
                        oi.total_price,
                        to_jsonb(pm) AS payment_method,
                        o.shipping_address_id,
                        c.user_id,
                        c.full_name,
                        c.email,
                        c.phone_no,
                        COUNT(*) OVER() AS total
                    FROM filtered_orders o
                    JOIN shop_user c ON o.customer_id = c.user_id
                    JOIN ordered_items oi ON o.order_id = oi.order_id
                    LEFT JOIN payment_method pm ON o.payment_method_id = pm.payment_method_id
                    WHERE (
                        CAST(:customerName AS BOOLEAN) IS NOT NULL OR\s
                        COALESCE(TRIM(CAST(:customerName AS TEXT)), '') = '' OR\s
                        c.full_name ILIKE CONCAT('%', CAST(:customerName AS TEXT), '%')
                    )
                """;
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> results = this.em.createNativeQuery(nativeQuery, Map.class)
                .setParameter("customerId", customerId)
                .setParameter("statuses", filters.getStatuses())
                .setParameter("fromDate", filters.getFromDate())
                .setParameter("toDate", filters.getToDate())
                .setParameter("trackingNumber", filters.getTrackingNumber())
                .setParameter("customerName", filters.getCustomerName())
                .setFirstResult(page * size)
                .setMaxResults(size)
                .getResultList();

        if (results.isEmpty())
            return new PageImpl<>(List.of(), Pageable.ofSize(size), 0);

        Map<String, Object> firstResult = results.get(0);
        long total = ((Number) firstResult.get("total")).longValue();

        List<OrderPreviewDTO> orderPreviews = results.stream()
                .map(result -> {
                    OrderPreviewDTO dto = new OrderPreviewDTO();
                    dto.setOrderId((Integer) result.get("order_id"));
                    dto.setOrderDate(((Timestamp) result.get("order_date")).toLocalDateTime());
                    dto.setStatus(OrderStatus.valueOf((String) result.get("status")));
                    dto.setTotalPrice(
                            result.get("total_price") != null ? ((Number) result.get("total_price")).doubleValue()
                                    : 0.0);
                    try {
                        @SuppressWarnings("unchecked")
                        Map<String, Object> pm = mapper.readValue((String) result.get("payment_method"), Map.class);
                        if (pm != null && pm.get("payment_method_id") != null) {
                            PaymentMethod paymentMethod = new PaymentMethod(
                                    ((Number) pm.get("payment_method_id")).intValue());
                            dto.setPaymentMethod(paymentMethod);
                        }
                    } catch (Exception ignored) {
                    }
                    CustomerContact customer = new CustomerContact();
                    customer.setCustomerId((Integer) result.get("user_id"));
                    customer.setCustomerName((String) result.get("full_name"));
                    customer.setEmail((String) result.get("email"));
                    customer.setPhoneNumber((String) result.get("phone_no"));
                    dto.setCustomer(customer);
                    return dto;
                })
                .collect(Collectors.toList());

        return new PageImpl<>(orderPreviews, PageRequest.of(page, size), total);
    }

    @Override
    public Optional<OrderDetails> getOrderDetails(Integer orderId) {
        String nativeQuery = """
                    WITH selected_order AS (
                        SELECT *
                        FROM shop_order
                        WHERE order_id = :orderId
                    ),
                    filtered_ordered_items AS (
                        SELECT *
                        FROM order_item
                        WHERE order_id = :orderId
                    ),
                    ordered_items AS (
                        SELECT
                            oi.order_id,
                            jsonb_agg(
                                jsonb_build_object(
                                    'order_item_id', oi.order_item_id,
                                    'product_variant_id', oi.product_variant_id,
                                    'quantity', oi.quantity,
                                    'price', oi.price,
                                    'product', to_jsonb(p),
                                    'product_variant', to_jsonb(pv),
                                    'shipping_method', to_jsonb(isv),
                                    'personalization', to_jsonb(pz)
                                )
                            ) AS order_items
                        FROM filtered_ordered_items oi
                        JOIN product_variant pv ON oi.product_variant_id = pv.product_variant_id
                        JOIN product p ON pv.product_id = p.product_id
                        LEFT JOIN shipping_method isv ON oi.shipping_method_id = isv.shipping_method_id
                        LEFT JOIN personalization pz ON oi.personalization_id = pz.personalization_id
                        GROUP BY oi.order_id
                    )
                    SELECT
                        o.order_id,
                        o.order_date,
                        o.estimated_delivery_date,
                        o.shipping_provider,
                        o.payment_provider,
                        o.carrier_name,
                        o.tracking_number,
                        o.status,
                        oi.order_items,
                        to_jsonb(sm) AS shipping_method,
                        to_jsonb(pm) AS payment_method,
                        to_jsonb(a) AS shipping_address,
                        c.user_id,
                        c.full_name,
                        c.email,
                        c.phone_no
                    FROM selected_order o
                    JOIN shop_user c ON o.customer_id = c.user_id
                    JOIN ordered_items oi ON oi.order_id = o.order_id
                    LEFT JOIN shipping_method sm ON o.shipping_method_id = sm.shipping_method_id
                    JOIN payment_method pm ON o.payment_method_id = pm.payment_method_id
                    LEFT JOIN address a ON a.address_id = o.shipping_address_id
                """;

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> results = this.em.createNativeQuery(nativeQuery, Map.class)
                .setParameter("orderId", orderId)
                .getResultList();

        if (results.isEmpty())
            return Optional.empty();

        Map<String, Object> result = results.get(0);

        OrderDetails orderDetails = new OrderDetails();
        orderDetails.setShopOrderId((Integer) result.get("order_id"));
        orderDetails.setOrderDate(((Timestamp) result.get("order_date")).toLocalDateTime());
        if (result.get("estimated_delivery_date") != null)
            orderDetails.setEstimatedDeliveryDate(((Date) result.get("estimated_delivery_date")).toLocalDate());
        orderDetails.setShippingProvider((String) result.get("shipping_provider"));
        orderDetails.setPaymentProvider((String) result.get("payment_provider"));
        orderDetails.setCarrierName((String) result.get("carrier_name"));
        orderDetails.setTrackingNumber((String) result.get("tracking_number"));
        orderDetails.setOrderStatus(OrderStatus.valueOf((String) result.get("status")));

        try {
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> orderItems = mapper.readValue((String) result.get("order_items"), List.class);
            List<OrderItem> items = orderItems.stream().map(item -> {
                OrderItem orderItem = new OrderItem();
                orderItem.setOrderItemId((Integer) item.get("order_item_id"));
                orderItem.setQuantity((Integer) item.get("quantity"));
                orderItem.setPrice(item.get("price") != null ? ((Number) item.get("price")).doubleValue() : 0.0);
                ProductVariant pv = mapper.convertValue(item.get("product_variant"), ProductVariant.class);
                // productVariantId explicitly set from order_item column (fixes null ID issue)
                if (pv != null && item.get("product_variant_id") != null)
                    pv.setProductVariantId(((Number) item.get("product_variant_id")).intValue());
                if (pv != null)
                    pv.setProduct(mapper.convertValue(item.get("product"), Product.class));
                orderItem.setProductVariant(pv);
                // per-item shipping method
                if (item.get("shipping_method") != null)
                    orderItem.setShippingMethod(mapper.convertValue(item.get("shipping_method"), ShippingMethod.class));
                orderItem.setPersonalization(mapper.convertValue(item.get("personalization"), Personalization.class));
                return orderItem;
            }).collect(Collectors.toList());
            orderDetails.setOrderItems(items);
        } catch (JsonProcessingException ignored) {
        }

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> sm = mapper.readValue((String) result.get("shipping_method"), Map.class);
            ShippingMethod shippingMethod = new ShippingMethod((Integer) sm.get("shipping_method_id"));
            orderDetails.setShippingMethod(shippingMethod);
        } catch (Exception ignored) {
        }

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> pm = mapper.readValue((String) result.get("payment_method"), Map.class);
            if (pm != null && pm.get("payment_method_id") != null) {
                PaymentMethod paymentMethod = new PaymentMethod(((Number) pm.get("payment_method_id")).intValue());
                orderDetails.setPaymentMethod(paymentMethod);
            }
        } catch (JsonProcessingException ignored) {
        }

        // Parse shipping address from to_jsonb(a) JSON
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> aMap = mapper.readValue((String) result.get("shipping_address"), Map.class);
            if (aMap != null) {
                Address addr = new Address();
                addr.setAddressId(aMap.get("address_id") != null ? ((Number) aMap.get("address_id")).intValue() : null);
                addr.setStreet((String) aMap.get("street"));
                addr.setCity((String) aMap.get("city"));
                addr.setCountry((String) aMap.get("country"));
                addr.setPincode(aMap.get("pincode") != null ? ((Number) aMap.get("pincode")).intValue() : null);
                orderDetails.setShippingAddress(addr);
            }
        } catch (Exception ignored) {
        }

        CustomerContact customer = new CustomerContact();
        customer.setCustomerId((Integer) result.get("user_id"));
        customer.setCustomerName((String) result.get("full_name"));
        customer.setEmail((String) result.get("email"));
        customer.setPhoneNumber((String) result.get("phone_no"));
        orderDetails.setCustomer(customer);

        return Optional.of(orderDetails);
    }
}
