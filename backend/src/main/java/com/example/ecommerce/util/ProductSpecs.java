package com.example.ecommerce.util;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.jpa.domain.Specification;

import com.example.ecommerce.entity.Product;

import jakarta.persistence.criteria.Predicate;

/** Builds the product search query from whichever filters the shopper chose. */
public final class ProductSpecs {

	private ProductSpecs() {
	}

	public static Specification<Product> filter(String q, Long categoryId, BigDecimal minPrice, BigDecimal maxPrice,
			boolean onlyActive) {
		return (root, query, cb) -> {
			List<Predicate> predicates = new ArrayList<>();

			if (onlyActive) {
				predicates.add(cb.isTrue(root.<Boolean>get("active")));
			}
			if (q != null && !q.isBlank()) {
				String like = "%" + q.trim().toLowerCase() + "%";
				predicates.add(cb.or(
						cb.like(cb.lower(root.<String>get("name")), like),
						cb.like(cb.lower(root.<String>get("brand")), like),
						cb.like(cb.lower(root.<String>get("description")), like)));
			}
			if (categoryId != null) {
				predicates.add(cb.equal(root.get("category").get("id"), categoryId));
			}
			if (minPrice != null) {
				predicates.add(cb.greaterThanOrEqualTo(root.<BigDecimal>get("price"), minPrice));
			}
			if (maxPrice != null) {
				predicates.add(cb.lessThanOrEqualTo(root.<BigDecimal>get("price"), maxPrice));
			}
			return cb.and(predicates.toArray(new Predicate[0]));
		};
	}
}
