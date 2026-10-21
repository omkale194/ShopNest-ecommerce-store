package com.example.ecommerce.web;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.ecommerce.dto.Dtos.CartDto;
import com.example.ecommerce.dto.Dtos.CartItemRequest;
import com.example.ecommerce.dto.Dtos.QuantityRequest;
import com.example.ecommerce.security.UserPrincipal;
import com.example.ecommerce.service.CartService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/cart")
public class CartController {

	private final CartService cartService;

	public CartController(CartService cartService) {
		this.cartService = cartService;
	}

	@GetMapping
	public CartDto cart(@AuthenticationPrincipal UserPrincipal me) {
		return cartService.getCart(me.id());
	}

	@PostMapping("/items")
	public CartDto add(@AuthenticationPrincipal UserPrincipal me, @Valid @RequestBody CartItemRequest request) {
		return cartService.addItem(me.id(), request.productId(), request.quantity());
	}

	@PutMapping("/items/{productId}")
	public CartDto setQuantity(@AuthenticationPrincipal UserPrincipal me, @PathVariable("productId") Long productId,
			@Valid @RequestBody QuantityRequest request) {
		return cartService.setQuantity(me.id(), productId, request.quantity());
	}

	@DeleteMapping("/items/{productId}")
	public CartDto remove(@AuthenticationPrincipal UserPrincipal me, @PathVariable("productId") Long productId) {
		return cartService.removeItem(me.id(), productId);
	}

	@DeleteMapping
	public CartDto clear(@AuthenticationPrincipal UserPrincipal me) {
		return cartService.clear(me.id());
	}
}
