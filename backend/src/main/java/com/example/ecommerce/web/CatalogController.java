package com.example.ecommerce.web;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.ecommerce.dto.Dtos.CategoryDto;
import com.example.ecommerce.dto.Dtos.PageDto;
import com.example.ecommerce.dto.Dtos.ProductDto;
import com.example.ecommerce.service.CategoryService;
import com.example.ecommerce.service.ProductService;

/** Public shop pages: anyone can browse without logging in. */
@RestController
@RequestMapping("/api")
public class CatalogController {

	private final ProductService productService;
	private final CategoryService categoryService;

	public CatalogController(ProductService productService, CategoryService categoryService) {
		this.productService = productService;
		this.categoryService = categoryService;
	}

	@GetMapping("/products")
	public PageDto<ProductDto> products(
			@RequestParam(name = "q", required = false) String q,
			@RequestParam(name = "category", required = false) Long categoryId,
			@RequestParam(name = "minPrice", required = false) BigDecimal minPrice,
			@RequestParam(name = "maxPrice", required = false) BigDecimal maxPrice,
			@RequestParam(name = "sort", required = false) String sort,
			@RequestParam(name = "page", defaultValue = "0") int page,
			@RequestParam(name = "size", defaultValue = "12") int size) {
		return productService.search(q, categoryId, minPrice, maxPrice, sort, page, size);
	}

	@GetMapping("/products/featured")
	public List<ProductDto> featured() {
		return productService.featured();
	}

	@GetMapping("/products/{id}")
	public ProductDto product(@PathVariable("id") Long id) {
		return productService.get(id);
	}

	@GetMapping("/categories")
	public List<CategoryDto> categories() {
		return categoryService.list();
	}
}
