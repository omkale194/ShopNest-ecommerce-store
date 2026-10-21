package com.example.ecommerce.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Every request/response shape of the API in one place. These are plain Java records, so the
 * database entities are never sent to the browser directly.
 */
public final class Dtos {

	private Dtos() {
	}

	// ---------- auth ----------
	public record RegisterRequest(
			@NotBlank(message = "Name is required") @Size(max = 100, message = "Name is too long") String name,
			@NotBlank(message = "Email is required") @Email(message = "Enter a valid email") @Size(max = 150) String email,
			@NotBlank(message = "Password is required") @Size(min = 6, max = 72, message = "Password must be 6 to 72 characters") String password) {
	}

	public record LoginRequest(
			@NotBlank(message = "Email is required") String email,
			@NotBlank(message = "Password is required") String password) {
	}

	public record UserDto(Long id, String name, String email, String role) {
	}

	public record AuthResponse(String token, UserDto user) {
	}

	// ---------- catalog ----------
	public record CategoryDto(Long id, String name) {
	}

	public record CategoryRequest(
			@NotBlank(message = "Category name is required") @Size(max = 80, message = "Name is too long") String name) {
	}

	public record ProductDto(Long id, String name, String description, String brand, BigDecimal price, BigDecimal mrp,
			int stock, String imageUrl, boolean featured, boolean active, Long categoryId, String categoryName) {
	}

	public record ProductRequest(
			@NotBlank(message = "Product name is required") @Size(max = 150, message = "Name is too long") String name,
			@Size(max = 1000, message = "Description is too long") String description,
			@Size(max = 80, message = "Brand is too long") String brand,
			@NotNull(message = "Price is required") @DecimalMin(value = "0.01", message = "Price must be greater than 0") BigDecimal price,
			@DecimalMin(value = "0.0", message = "MRP cannot be negative") BigDecimal mrp,
			@Min(value = 0, message = "Stock cannot be negative") int stock,
			@Size(max = 500, message = "Image link is too long") String imageUrl,
			boolean featured,
			Boolean active,
			@NotNull(message = "Category is required") Long categoryId) {
	}

	public record PageDto<T>(List<T> items, int page, int size, long totalElements, int totalPages) {
		public static <T> PageDto<T> from(Page<T> p) {
			return new PageDto<>(p.getContent(), p.getNumber(), p.getSize(), p.getTotalElements(), p.getTotalPages());
		}
	}

	// ---------- cart ----------
	public record CartItemRequest(
			@NotNull(message = "Product is required") Long productId,
			@Min(value = 1, message = "Quantity must be at least 1") @Max(value = 99, message = "Quantity is too large") int quantity) {
	}

	public record QuantityRequest(
			@Min(value = 1, message = "Quantity must be at least 1") @Max(value = 99, message = "Quantity is too large") int quantity) {
	}

	public record CartItemDto(Long productId, String name, String imageUrl, BigDecimal price, int quantity, int stock,
			boolean available, BigDecimal lineTotal) {
	}

	public record CartDto(List<CartItemDto> items, int itemCount, BigDecimal subtotal) {
	}

	// ---------- orders ----------
	public record CheckoutRequest(
			@NotBlank(message = "Full name is required") @Size(max = 100) String fullName,
			@NotBlank(message = "Phone is required") @Pattern(regexp = "^[0-9+\\- ]{8,15}$", message = "Enter a valid phone number") String phone,
			@NotBlank(message = "Address is required") @Size(max = 300) String addressLine,
			@NotBlank(message = "City is required") @Size(max = 80) String city,
			@NotBlank(message = "State is required") @Size(max = 80) String state,
			@NotBlank(message = "Pincode is required") @Pattern(regexp = "^[0-9]{6}$", message = "Pincode must be 6 digits") String pincode,
			@NotBlank(message = "Choose a payment method") String paymentMethod) {
	}

	public record OrderItemDto(Long productId, String name, String imageUrl, BigDecimal unitPrice, int quantity,
			BigDecimal lineTotal) {
	}

	public record OrderDto(Long id, String status, BigDecimal total, String paymentMethod, String fullName,
			String phone, String address, String city, String state, String pincode, LocalDateTime createdAt,
			String customerName, String customerEmail, List<OrderItemDto> items) {
	}

	public record StatusRequest(@NotBlank(message = "Status is required") String status) {
	}

	// ---------- admin ----------
	public record StatsDto(long products, long orders, long customers, BigDecimal revenue) {
	}

	// ---------- errors ----------
	public record ErrorResponse(int status, String message, Map<String, String> errors) {
	}
}
