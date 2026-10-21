package com.example.ecommerce.service;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.ecommerce.dto.Dtos.PageDto;
import com.example.ecommerce.dto.Dtos.ProductDto;
import com.example.ecommerce.dto.Dtos.ProductRequest;
import com.example.ecommerce.entity.Category;
import com.example.ecommerce.entity.Product;
import com.example.ecommerce.exception.ApiException;
import com.example.ecommerce.repository.CategoryRepository;
import com.example.ecommerce.repository.ProductRepository;
import com.example.ecommerce.util.Mappers;
import com.example.ecommerce.util.ProductSpecs;

@Service
public class ProductService {

	private final ProductRepository productRepository;
	private final CategoryRepository categoryRepository;

	public ProductService(ProductRepository productRepository, CategoryRepository categoryRepository) {
		this.productRepository = productRepository;
		this.categoryRepository = categoryRepository;
	}

	// ---------- shop (public) ----------

	@Transactional(readOnly = true)
	public PageDto<ProductDto> search(String q, Long categoryId, BigDecimal minPrice, BigDecimal maxPrice, String sort,
			int page, int size) {
		return query(q, categoryId, minPrice, maxPrice, sort, page, size, true);
	}

	@Transactional(readOnly = true)
	public List<ProductDto> featured() {
		return productRepository.findByFeaturedTrueAndActiveTrueOrderByIdAsc().stream().map(Mappers::productDto)
				.toList();
	}

	@Transactional(readOnly = true)
	public ProductDto get(Long id) {
		return productRepository.findByIdAndActiveTrue(id).map(Mappers::productDto)
				.orElseThrow(() -> ApiException.notFound("Product not found"));
	}

	// ---------- admin ----------

	@Transactional(readOnly = true)
	public PageDto<ProductDto> adminSearch(String q, int page, int size) {
		return query(q, null, null, null, "newest", page, size, false);
	}

	@Transactional
	public ProductDto create(ProductRequest req) {
		Product product = new Product();
		apply(product, req);
		product.setActive(req.active() == null || req.active());
		return Mappers.productDto(productRepository.save(product));
	}

	@Transactional
	public ProductDto update(Long id, ProductRequest req) {
		Product product = productRepository.findById(id).orElseThrow(() -> ApiException.notFound("Product not found"));
		apply(product, req);
		if (req.active() != null) {
			product.setActive(req.active());
		}
		return Mappers.productDto(product);
	}

	/** "Deleting" hides the product from the shop; old orders keep pointing to it. */
	@Transactional
	public void deactivate(Long id) {
		Product product = productRepository.findById(id).orElseThrow(() -> ApiException.notFound("Product not found"));
		product.setActive(false);
	}

	// ---------- helpers ----------

	private PageDto<ProductDto> query(String q, Long categoryId, BigDecimal minPrice, BigDecimal maxPrice, String sort,
			int page, int size, boolean onlyActive) {
		Pageable pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 48), sortFor(sort));
		Page<Product> result = productRepository
				.findAll(ProductSpecs.filter(q, categoryId, minPrice, maxPrice, onlyActive), pageable);
		return PageDto.from(result.map(Mappers::productDto));
	}

	private Sort sortFor(String sort) {
		String s = sort == null ? "" : sort;
		return switch (s) {
		case "price_asc" -> Sort.by(Sort.Direction.ASC, "price");
		case "price_desc" -> Sort.by(Sort.Direction.DESC, "price");
		case "newest" -> Sort.by(Sort.Direction.DESC, "id");
		case "name" -> Sort.by(Sort.Direction.ASC, "name");
		default -> Sort.by(Sort.Direction.DESC, "featured").and(Sort.by(Sort.Direction.ASC, "id"));
		};
	}

	private void apply(Product product, ProductRequest req) {
		Category category = categoryRepository.findById(req.categoryId())
				.orElseThrow(() -> ApiException.badRequest("Category not found"));
		if (req.mrp() != null && req.mrp().signum() > 0 && req.mrp().compareTo(req.price()) < 0) {
			throw ApiException.badRequest("MRP must not be lower than the selling price");
		}
		product.setName(req.name().trim());
		product.setDescription(blankToNull(req.description()));
		product.setBrand(blankToNull(req.brand()));
		product.setPrice(req.price());
		product.setMrp(req.mrp() == null || req.mrp().signum() == 0 ? null : req.mrp());
		product.setStock(req.stock());
		product.setImageUrl(blankToNull(req.imageUrl()));
		product.setFeatured(req.featured());
		product.setCategory(category);
	}

	private String blankToNull(String value) {
		return value == null || value.isBlank() ? null : value.trim();
	}
}
