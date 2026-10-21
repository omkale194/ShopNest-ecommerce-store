package com.example.ecommerce.web;

import java.util.List;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.ecommerce.dto.Dtos.CheckoutRequest;
import com.example.ecommerce.dto.Dtos.OrderDto;
import com.example.ecommerce.security.UserPrincipal;
import com.example.ecommerce.service.OrderService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

	private final OrderService orderService;

	public OrderController(OrderService orderService) {
		this.orderService = orderService;
	}

	@PostMapping
	public OrderDto checkout(@AuthenticationPrincipal UserPrincipal me, @Valid @RequestBody CheckoutRequest request) {
		return orderService.placeOrder(me.id(), request);
	}

	@GetMapping
	public List<OrderDto> myOrders(@AuthenticationPrincipal UserPrincipal me) {
		return orderService.myOrders(me.id());
	}

	@GetMapping("/{id}")
	public OrderDto myOrder(@AuthenticationPrincipal UserPrincipal me, @PathVariable("id") Long id) {
		return orderService.myOrder(me.id(), id);
	}

	@PostMapping("/{id}/cancel")
	public OrderDto cancel(@AuthenticationPrincipal UserPrincipal me, @PathVariable("id") Long id) {
		return orderService.cancel(me.id(), id);
	}
}
