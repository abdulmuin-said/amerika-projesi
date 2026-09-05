package com.TechKun.dao;

import com.TechKun.dto.report_dtos.*;
import com.TechKun.model.Address;
import jakarta.persistence.EntityManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Repository
public class ReportRepository {

    @Autowired
    private EntityManager em;

    public SalesReportResponse groupSalesByPeriod(LocalDate start, LocalDate end) {
        String nativeQuery = """
            WITH selected_orders AS (
                SELECT
                    TO_CHAR(o.order_date, 'YYYY-MM-DD') AS order_day,
                    oi.price * oi.quantity AS sales
                FROM shop_order o
                JOIN order_item oi ON o.order_id = oi.order_id
                WHERE o.order_date BETWEEN :start AND :end
            )
            SELECT
                order_day,
                SUM(sales) AS total_sales,
                COUNT(*) AS total_orders
            FROM selected_orders
            GROUP BY order_day
            ORDER BY order_day
        """;

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> results = (List<Map<String, Object>>) this.em.createNativeQuery(nativeQuery, Map.class)
            .setParameter("start", start)
            .setParameter("end", end)
            .getResultList();
        if (results.isEmpty())
            return new SalesReportResponse();

        List<SalesByPeriod> sales = results.stream()
            .map(row -> new SalesByPeriod(
                (String) row.get("order_day"),
                ((Number) row.get("total_sales")).doubleValue(),
                ((Number) row.get("total_orders")).intValue()
            ))
            .collect(Collectors.toList());

        SalesReportResponse salesReportResponse = new SalesReportResponse();
        sales.forEach(cur -> {
            salesReportResponse.setTotalSales(salesReportResponse.getTotalSales() + cur.getSales());
            salesReportResponse.setTotalOrders(salesReportResponse.getTotalOrders() + cur.getTotalOrders());
        });
        salesReportResponse.setAverageOrderValue(salesReportResponse.getTotalSales() / sales.size());
        salesReportResponse.setSalesByPeriod(sales);

        return salesReportResponse;
    }
//    public CategoryPerformanceResponse getCategoryPerformance(LocalDate start, LocalDate end) {
//        String sql = """
//        SELECT
//            c.category_id AS categoryId,
//            c.name AS categoryName,
//            SUM(oi.quantity) AS unitsSold,
//            SUM(oi.quantity * oi.price) AS revenue
//        FROM shop_order o
//        JOIN order_item oi ON o.order_id = oi.order_id
//        JOIN product_variant pv ON oi.product_variant_id = pv.product_variant_id
//        JOIN product p ON pv.product_id = p.product_id
//        JOIN category c ON p.category_id = c.category_id
//        WHERE o.order_date BETWEEN :start AND :end
//        GROUP BY c.category_id, c.name
//        ORDER BY revenue DESC
//    """;
//
//        @SuppressWarnings("unchecked")
//        List<Map<String, Object>> results = em.createNativeQuery(sql, Map.class)
//                .setParameter("start", start)
//                .setParameter("end", end)
//                .getResultList();
//
//        List<CategoryPerformance> categories = results.stream()
//                .map(row -> new CategoryPerformance(
//                        ((Number) row.get("categoryId")).longValue(),
//                        (String) row.get("categoryName"),
//                        ((Number) row.get("unitsSold")).intValue(),
//                        ((Number) row.get("revenue")).doubleValue()
//                ))
//                .collect(Collectors.toList());
//
//        double totalRevenue = categories.stream().mapToDouble(CategoryPerformance::getRevenue).sum();
//        int totalUnits = categories.stream().mapToInt(CategoryPerformance::getUnitsSold).sum();
//
//        CategoryPerformanceResponse response = new CategoryPerformanceResponse();
//        response.setCategories(categories);
//        response.setTotalRevenue(totalRevenue);
//        response.setTotalUnitsSold(totalUnits);
//
//        return response;
//    }
    public CategoryPerformanceResponse getCategoryPerformance(LocalDate start, LocalDate end) {
        String sql = """
            SELECT
                c.category_id AS categoryId,
                c.name AS categoryName,
                SUM(oi.quantity) AS unitsSold,
                SUM(oi.quantity * oi.price) AS revenue
            FROM shop_order o
            JOIN order_item oi ON o.order_id = oi.order_id
            JOIN product_variant pv ON oi.product_variant_id = pv.product_variant_id
            JOIN product p ON pv.product_id = p.product_id
            JOIN category c ON p.category_id = c.category_id
            WHERE o.order_date BETWEEN :start AND :end
            GROUP BY c.category_id, c.name
            ORDER BY revenue DESC
        """;

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> results = em.createNativeQuery(sql, Map.class)
            .setParameter("start", start)
            .setParameter("end", end)
            .getResultList();

        List<CategoryPerformance> categories = results.stream()
            .map(row -> new CategoryPerformance(
                row.get("categoryId") != null ? ((Number) row.get("categoryId")).longValue() : 0L,
                (String) row.get("categoryName"),
                row.get("unitsSold") != null ? ((Number) row.get("unitsSold")).intValue() : 0,
                row.get("revenue") != null ? ((Number) row.get("revenue")).doubleValue() : 0.0
            ))
            .collect(Collectors.toList());

        double totalRevenue = categories.stream()
            .mapToDouble(CategoryPerformance::getRevenue)
            .sum();

        int totalUnits = categories.stream()
            .mapToInt(CategoryPerformance::getUnitsSold)
            .sum();

        CategoryPerformanceResponse response = new CategoryPerformanceResponse();
        response.setCategories(categories);
        response.setTotalRevenue(totalRevenue);
        response.setTotalUnitsSold(totalUnits);

        return response;
    }


    public List<OrderStatusReport> getOrdersGroupedByStatus(LocalDate start, LocalDate end) {
        String sql = """
            SELECT
                o.status AS status,
                COUNT(*) AS count
            FROM shop_order o
            WHERE o.order_date BETWEEN :start AND :end
            GROUP BY o.status
            ORDER BY count DESC
        """;

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> results = em.createNativeQuery(sql, Map.class)
            .setParameter("start", start)
            .setParameter("end", end)
            .getResultList();

        return results.stream()
            .map(row -> new OrderStatusReport(
                    (String) row.get("status"),
                    row.get("count") != null ? ((Number) row.get("count")).longValue() : 0L
            ))
            .collect(Collectors.toList());
    }
    public CustomerReportResponse getCustomerReport(LocalDate start, LocalDate end) {
        // ✅ Total customers onboarded using correct table + column
        long onboarded = ((Number) em.createNativeQuery("""
                SELECT COUNT(*) FROM shop_user
                WHERE joined_at BETWEEN :start AND :end
            """)
            .setParameter("start", start)
            .setParameter("end", end)
            .getSingleResult()).longValue();

        // ✅ Total active customers (who placed at least one order)
        long active = ((Number) em.createNativeQuery("""
                SELECT COUNT(DISTINCT customer_id) FROM shop_order
                WHERE order_date BETWEEN :start AND :end
            """)
            .setParameter("start", start)
            .setParameter("end", end)
            .getSingleResult()).longValue();

        // ✅ Top 10 customers by total spent
        String sql = """
            SELECT
                u.user_id AS userId,
                u.full_name AS fullName,
                SUM(oi.quantity * oi.price) AS totalSpent,
                SUM(oi.quantity) AS orderedItems,
                u.phone_no AS phoneNo,
                u.email AS email,
                u.address_id AS addressId
            FROM shop_order o
            JOIN order_item oi ON o.order_id = oi.order_id
            JOIN shop_user u ON o.customer_id = u.user_id
            WHERE o.order_date BETWEEN :start AND :end
            GROUP BY u.user_id, u.full_name, u.phone_no, u.email, u.address_id
            ORDER BY totalSpent DESC
            LIMIT 10
        """;

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> results = em.createNativeQuery(sql, Map.class)
            .setParameter("start", start)
            .setParameter("end", end)
            .getResultList();

        List<TopCustomer> topCustomers = results.stream()
            .map(row -> {
                Address address = null;
                if (row.get("addressid") != null) {
                    Long addressId = ((Number) row.get("addressid")).longValue();
                    address = em.find(Address.class, addressId);
                }
                return new TopCustomer(
                    row.get("userid") != null ? ((Number) row.get("userid")).longValue() : 0L,
                    (String) row.get("fullname"),
                    row.get("totalspent") != null ? ((Number) row.get("totalspent")).doubleValue() : 0.0,
                    row.get("ordereditems") != null ? ((Number) row.get("ordereditems")).intValue() : 0,
                    (String) row.get("phoneno"),
                    (String) row.get("email"),
                    address
                );
            })
            .collect(Collectors.toList());

        CustomerReportResponse response = new CustomerReportResponse();
        response.setCustomersOnboarded((int) onboarded);
        response.setActiveCustomers((int) active);
        response.setTopCustomers(topCustomers);
        return response;
    }
    public ProductPerformanceResponse getProductPerformance(LocalDate start, LocalDate end) {
        String sql = """
        SELECT 
            p.product_id AS productId,
            p.title AS productTitle,
            COUNT(DISTINCT o.order_id) AS purchases,
            SUM(oi.quantity) AS unitsSold,
            SUM(oi.quantity * oi.price) AS revenue,
            COALESCE(SUM(r.return_qty), 0) AS returns
        FROM product p
        JOIN product_variant pv ON p.product_id = pv.product_id
        LEFT JOIN order_item oi ON oi.product_variant_id = pv.product_variant_id
        LEFT JOIN shop_order o ON o.order_id = oi.order_id AND o.order_date BETWEEN :start AND :end
        LEFT JOIN (
            SELECT oi.product_variant_id, SUM(oi.quantity) AS return_qty
            FROM order_item oi
            JOIN shop_order o ON o.order_id = oi.order_id
            WHERE o.status = 'RETURNED' AND o.order_date BETWEEN :start AND :end
            GROUP BY oi.product_variant_id
        ) r ON r.product_variant_id = pv.product_variant_id
        WHERE o.order_date BETWEEN :start AND :end
        GROUP BY p.product_id, p.title
        ORDER BY revenue DESC
    """;

        List<Map<String, Object>> rows = em.createNativeQuery(sql, Map.class)
                .setParameter("start", start)
                .setParameter("end", end)
                .getResultList();

        List<ProductPerformance> products = rows.stream().map(row -> {
            int views = 0;
            double conversionRate = 0.0;

            int purchases = row.get("purchases") != null ? ((Number) row.get("purchases")).intValue() : 0;
            int unitsSold = row.get("unitssold") != null ? ((Number) row.get("unitssold")).intValue() : 0;
            double revenue = row.get("revenue") != null ? ((Number) row.get("revenue")).doubleValue() : 0.0;
            int returns = row.get("returns") != null ? ((Number) row.get("returns")).intValue() : 0;
            double returnRate = unitsSold > 0 ? (double) returns / unitsSold * 100 : 0.0;

            return new ProductPerformance(
                    row.get("productid") != null ? ((Number) row.get("productid")).longValue() : 0L,
                    (String) row.get("producttitle"),
                    views,
                    purchases,
                    conversionRate,
                    returnRate,
                    unitsSold,
                    revenue
            );
        }).toList();

        int totalViews = 0;
        int totalPurchases = products.stream().mapToInt(ProductPerformance::getPurchases).sum();
        double totalRevenue = products.stream().mapToDouble(ProductPerformance::getRevenue).sum();
        double averageConversionRate = 0.0;
        double averageReturnRate = products.isEmpty() ? 0.0 : products.stream().mapToDouble(ProductPerformance::getReturnRate).average().orElse(0.0);
        double averageOrderValue = totalPurchases > 0 ? totalRevenue / totalPurchases : 0.0;

        ProductPerformanceResponse response = new ProductPerformanceResponse();
        response.setProducts(products);
        response.setTotalViews(totalViews);
        response.setTotalPurchases(totalPurchases);
        response.setTotalRevenue(totalRevenue);
        response.setAverageConversionRate(averageConversionRate);
        response.setAverageReturnRate(averageReturnRate);
        response.setAverageOrderValue(averageOrderValue);

        return response;
    }
    public DiscountPerformanceResponse getDiscountPerformance(LocalDate start, LocalDate end) {
        String sql = """
        SELECT
            COALESCE(SUM(oi.price * oi.quantity), 0) AS totalRevenueInfluenced,
            COALESCE(AVG(order_totals.order_total), 0) AS averageOrderValue
        FROM shop_order o
        JOIN order_item oi ON o.order_id = oi.order_id
        JOIN (
            SELECT o2.order_id, SUM(oi2.price * oi2.quantity) AS order_total
            FROM shop_order o2
            JOIN order_item oi2 ON o2.order_id = oi2.order_id
            WHERE o2.order_date BETWEEN :start AND :end
            GROUP BY o2.order_id
        ) AS order_totals ON o.order_id = order_totals.order_id
        WHERE o.order_date BETWEEN :start AND :end
    """;

        Map<String, Object> row = (Map<String, Object>) em.createNativeQuery(sql, Map.class)
                .setParameter("start", start)
                .setParameter("end", end)
                .getSingleResult();

        DiscountPerformanceResponse response = new DiscountPerformanceResponse();
        response.setTotalRevenueInfluenced(row.get("totalRevenueInfluenced") != null ?
                ((Number) row.get("totalRevenueInfluenced")).doubleValue() : 0.0);
        response.setAverageOrderValue(row.get("averageOrderValue") != null ?
                ((Number) row.get("averageOrderValue")).doubleValue() : 0.0);
        return response;
    }






}
