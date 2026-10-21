package com.example.ecommerce.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import com.example.ecommerce.entity.CartItem;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {

	@EntityGraph(attributePaths = "product")
	List<CartItem> findByUserIdOrderByIdAsc(Long userId);

	@EntityGraph(attributePaths = "product")
	Optional<CartItem> findByUserIdAndProductId(Long userId, Long productId);
}
