package com.example.ecommerce.service;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.ecommerce.dto.Dtos.CartDto;
import com.example.ecommerce.dto.Dtos.CartItemDto;
import com.example.ecommerce.entity.CartItem;
import com.example.ecommerce.entity.Product;
import com.example.ecommerce.entity.User;
import com.example.ecommerce.exception.ApiException;
import com.example.ecommerce.repository.CartItemRepository;
import com.example.ecommerce.repository.ProductRepository;
import com.example.ecommerce.repository.UserRepository;
import com.example.ecommerce.util.Mappers;

@Service
public class CartService {

	private final CartItemRepository cartItemRepository;
	private final ProductRepository productRepository;
	private final UserRepository userRepository;

	public CartService(CartItemRepository cartItemRepository, ProductRepository productRepository,
			UserRepository userRepository) {
		this.cartItemRepository = cartItemRepository;
		this.productRepository = productRepository;
		this.userRepository = userRepository;
	}

	@Transactional(readOnly = true)
	public CartDto getCart(Long userId) {
		List<CartItemDto> items = cartItemRepository.findByUserIdOrderByIdAsc(userId).stream()
				.map(Mappers::cartItemDto).toList();
		BigDecimal subtotal = items.stream().map(CartItemDto::lineTotal).reduce(BigDecimal.ZERO, BigDecimal::add);
		int count = items.stream().mapToInt(CartItemDto::quantity).sum();
		return new CartDto(items, count, subtotal);
	}

	/** Adds the product, or increases the quantity if it is already in the cart. */
	@Transactional
	public CartDto addItem(Long userId, Long productId, int quantity) {
		Product product = productRepository.findByIdAndActiveTrue(productId)
				.orElseThrow(() -> ApiException.notFound("Product not found"));
		CartItem item = cartItemRepository.findByUserIdAndProductId(userId, productId).orElse(null);
		int newQuantity = (item == null ? 0 : item.getQuantity()) + quantity;
		checkStock(product, newQuantity);

		if (item == null) {
			User user = userRepository.getReferenceById(userId);
			item = new CartItem(user, product, newQuantity);
		} else {
			item.setQuantity(newQuantity);
		}
		cartItemRepository.save(item);
		return getCart(userId);
	}

	@Transactional
	public CartDto setQuantity(Long userId, Long productId, int quantity) {
		CartItem item = cartItemRepository.findByUserIdAndProductId(userId, productId)
				.orElseThrow(() -> ApiException.notFound("This item is not in your cart"));
		checkStock(item.getProduct(), quantity);
		item.setQuantity(quantity);
		return getCart(userId);
	}

	@Transactional
	public CartDto removeItem(Long userId, Long productId) {
		cartItemRepository.findByUserIdAndProductId(userId, productId).ifPresent(cartItemRepository::delete);
		return getCart(userId);
	}

	@Transactional
	public CartDto clear(Long userId) {
		cartItemRepository.deleteAll(cartItemRepository.findByUserIdOrderByIdAsc(userId));
		return getCart(userId);
	}

	private void checkStock(Product product, int wanted) {
		if (product.getStock() <= 0) {
			throw ApiException.conflict(product.getName() + " is out of stock");
		}
		if (wanted > product.getStock()) {
			throw ApiException.conflict("Only " + product.getStock() + " left of " + product.getName());
		}
	}
}
