package com.example.ecommerce.web;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.ecommerce.dto.Dtos.CategoryDto;
import com.example.ecommerce.dto.Dtos.CategoryRequest;
import com.example.ecommerce.dto.Dtos.OrderDto;
import com.example.ecommerce.dto.Dtos.PageDto;
import com.example.ecommerce.dto.Dtos.ProductDto;
import com.example.ecommerce.dto.Dtos.ProductRequest;
import com.example.ecommerce.dto.Dtos.StatsDto;
import com.example.ecommerce.dto.Dtos.StatusRequest;
import com.example.ecommerce.service.CategoryService;
import com.example.ecommerce.service.OrderService;
import com.example.ecommerce.service.ProductService;

import jakarta.validation.Valid;

/** Everything under /api/admin needs an ADMIN login (see SecurityConfig). */
@RestController
@RequestMapping("/api/admin")
public class AdminController {

	private final ProductService productService;
	private final CategoryService categoryService;
	private final OrderService orderService;

	public AdminController(ProductService productService, CategoryService categoryService,
			OrderService orderService) {
		this.productService = productService;
		this.categoryService = categoryService;
		this.orderService = orderService;
	}

	@GetMapping("/stats")
	public StatsDto stats() {
		return orderService.stats();
	}

	// ---------- products ----------

	@GetMapping("/products")
	public PageDto<ProductDto> products(@RequestParam(name = "q", required = false) String q,
			@RequestParam(name = "page", defaultValue = "0") int page,
			@RequestParam(name = "size", defaultValue = "20") int size) {
		return productService.adminSearch(q, page, size);
	}

	@PostMapping("/products")
	public ResponseEntity<ProductDto> createProduct(@Valid @RequestBody ProductRequest request) {
		return ResponseEntity.status(HttpStatus.CREATED).body(productService.create(request));
	}

	@PutMapping("/products/{id}")
	public ProductDto updateProduct(@PathVariable("id") Long id, @Valid @RequestBody ProductRequest request) {
		return productService.update(id, request);
	}

	/** Hides the product from the shop (old orders keep working). */
	@DeleteMapping("/products/{id}")
	public ResponseEntity<Void> hideProduct(@PathVariable("id") Long id) {
		productService.deactivate(id);
		return ResponseEntity.noContent().build();
	}

	// ---------- categories ----------

	@PostMapping("/categories")
	public ResponseEntity<CategoryDto> createCategory(@Valid @RequestBody CategoryRequest request) {
		return ResponseEntity.status(HttpStatus.CREATED).body(categoryService.create(request));
	}

	@PutMapping("/categories/{id}")
	public CategoryDto updateCategory(@PathVariable("id") Long id, @Valid @RequestBody CategoryRequest request) {
		return categoryService.update(id, request);
	}

	@DeleteMapping("/categories/{id}")
	public ResponseEntity<Void> deleteCategory(@PathVariable("id") Long id) {
		categoryService.delete(id);
		return ResponseEntity.noContent().build();
	}

	// ---------- orders ----------

	@GetMapping("/orders")
	public List<OrderDto> orders() {
		return orderService.allOrders();
	}

	@PutMapping("/orders/{id}/status")
	public OrderDto setStatus(@PathVariable("id") Long id, @Valid @RequestBody StatusRequest request) {
		return orderService.updateStatus(id, request.status());
	}
}
