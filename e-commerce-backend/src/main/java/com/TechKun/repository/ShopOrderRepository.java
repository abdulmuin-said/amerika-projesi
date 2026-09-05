//package com.TechKun.repository;
//
//import com.TechKun.dto.report_dtos.SalesByPeriod;
//import org.springframework.data.jpa.repository.JpaRepository;
//
//import com.TechKun.dao.ShopOrderRepositoryExtension;
//import com.TechKun.model.ShopOrder;
//import org.springframework.data.jpa.repository.Query;
//import org.springframework.data.repository.query.Param;
//
//import java.time.LocalDate;
//import java.util.List;
//
//public interface ShopOrderRepository extends JpaRepository<ShopOrder, Integer>, ShopOrderRepositoryExtension {
//    @Query(
//            value = """
//            SELECT
//                TO_CHAR(o.order_date, 'YYYY-MM-DD') AS order_day,
//                SUM(oi.price * oi.quantity) AS total_sales
//            FROM shop_order o
//            JOIN order_item oi ON o.shop_order_id = oi.shop_order_id
//            WHERE o.order_date BETWEEN :start AND :end
//            GROUP BY TO_CHAR(o.order_date, 'YYYY-MM-DD')
//            ORDER BY order_day
//        """,
//            nativeQuery = true
//    )
//    List<Object[]> groupSalesByPeriod(@Param("start") LocalDate start, @Param("end") LocalDate end);
//
//    @Query(
//            value = """
//            SELECT SUM(oi.price * oi.quantity)
//            FROM shop_order o
//            JOIN order_item oi ON o.shop_order_id = oi.shop_order_id
//            WHERE o.order_date BETWEEN :startDate AND :endDate
//        """,
//            nativeQuery = true
//    )
//    Double calculateTotalSales(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
//
//    @Query(
//            value = """
//            SELECT COUNT(*)
//            FROM shop_order
//            WHERE order_date BETWEEN :start AND :end
//        """,
//            nativeQuery = true
//    )
//    int countTotalOrders(@Param("start") LocalDate start, @Param("end") LocalDate end);
//}
//
//
package com.TechKun.repository;

import com.TechKun.dao.ShopOrderRepositoryExtension;
import com.TechKun.model.ShopOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ShopOrderRepository extends JpaRepository<ShopOrder, Integer>, ShopOrderRepositoryExtension {

    @Query(value = """
        SELECT COUNT(*)
        FROM order_item oi
        JOIN product_variant pv ON oi.product_variant_id = pv.product_variant_id
        WHERE pv.product_id = :productId
    """, nativeQuery = true)
    long countOrdersByProductId(@Param("productId") Integer productId);

}
