package com.example.ecommerce.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import com.example.ecommerce.entity.Product;

public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {

	// @EntityGraph loads the category in the same query, which avoids the "N+1 queries" problem
	@EntityGraph(attributePaths = "category")
	Page<Product> findAll(Specification<Product> spec, Pageable pageable);

	@EntityGraph(attributePaths = "category")
	List<Product> findByFeaturedTrueAndActiveTrueOrderByIdAsc();

	@EntityGraph(attributePaths = "category")
	Optional<Product> findByIdAndActiveTrue(Long id);

	long countByCategoryId(Long categoryId);
}
