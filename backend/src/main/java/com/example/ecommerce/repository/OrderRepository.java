package com.example.ecommerce.repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.ecommerce.entity.CustomerOrder;
import com.example.ecommerce.entity.OrderStatus;

public interface OrderRepository extends JpaRepository<CustomerOrder, Long> {

	@EntityGraph(attributePaths = { "items", "user" })
	List<CustomerOrder> findByUserIdOrderByCreatedAtDescIdDesc(Long userId);

	@EntityGraph(attributePaths = { "items", "user" })
	List<CustomerOrder> findAllByOrderByCreatedAtDescIdDesc();

	@EntityGraph(attributePaths = { "items", "user" })
	Optional<CustomerOrder> findDetailedById(Long id);

	// total money of all orders except the given status (used for the admin dashboard)
	@Query("select sum(o.total) from CustomerOrder o where o.status <> :status")
	BigDecimal sumTotalExcluding(@Param("status") OrderStatus status);
}
