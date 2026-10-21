package com.example.ecommerce.util;

import java.math.BigDecimal;
import java.util.List;

import com.example.ecommerce.dto.Dtos.CartItemDto;
import com.example.ecommerce.dto.Dtos.CategoryDto;
import com.example.ecommerce.dto.Dtos.OrderDto;
import com.example.ecommerce.dto.Dtos.OrderItemDto;
import com.example.ecommerce.dto.Dtos.ProductDto;
import com.example.ecommerce.dto.Dtos.UserDto;
import com.example.ecommerce.entity.CartItem;
import com.example.ecommerce.entity.Category;
import com.example.ecommerce.entity.CustomerOrder;
import com.example.ecommerce.entity.OrderItem;
import com.example.ecommerce.entity.Product;
import com.example.ecommerce.entity.User;

/** Converts database entities into the JSON shapes sent to the browser. */
public final class Mappers {

	private Mappers() {
	}

	public static UserDto userDto(User u) {
		return new UserDto(u.getId(), u.getName(), u.getEmail(), u.getRole().name());
	}

	public static CategoryDto categoryDto(Category c) {
		return new CategoryDto(c.getId(), c.getName());
	}

	public static ProductDto productDto(Product p) {
		Category c = p.getCategory();
		return new ProductDto(p.getId(), p.getName(), p.getDescription(), p.getBrand(), p.getPrice(), p.getMrp(),
				p.getStock(), p.getImageUrl(), p.isFeatured(), p.isActive(), c == null ? null : c.getId(),
				c == null ? null : c.getName());
	}

	public static CartItemDto cartItemDto(CartItem ci) {
		Product p = ci.getProduct();
		BigDecimal line = p.getPrice().multiply(BigDecimal.valueOf(ci.getQuantity()));
		boolean available = p.isActive() && p.getStock() >= ci.getQuantity();
		return new CartItemDto(p.getId(), p.getName(), p.getImageUrl(), p.getPrice(), ci.getQuantity(), p.getStock(),
				available, line);
	}

	public static OrderItemDto orderItemDto(OrderItem oi) {
		BigDecimal line = oi.getUnitPrice().multiply(BigDecimal.valueOf(oi.getQuantity()));
		Long productId = oi.getProduct() == null ? null : oi.getProduct().getId();
		return new OrderItemDto(productId, oi.getProductName(), oi.getImageUrl(), oi.getUnitPrice(), oi.getQuantity(),
				line);
	}

	public static OrderDto orderDto(CustomerOrder o) {
		List<OrderItemDto> items = o.getItems().stream().map(Mappers::orderItemDto).toList();
		User u = o.getUser();
		return new OrderDto(o.getId(), o.getStatus().name(), o.getTotal(), o.getPaymentMethod(), o.getShipFullName(),
				o.getShipPhone(), o.getShipAddress(), o.getShipCity(), o.getShipState(), o.getShipPincode(),
				o.getCreatedAt(), u == null ? null : u.getName(), u == null ? null : u.getEmail(), items);
	}
}
