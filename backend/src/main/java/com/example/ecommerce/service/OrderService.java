package com.example.ecommerce.service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.ecommerce.dto.Dtos.CheckoutRequest;
import com.example.ecommerce.dto.Dtos.OrderDto;
import com.example.ecommerce.dto.Dtos.StatsDto;
import com.example.ecommerce.entity.CartItem;
import com.example.ecommerce.entity.CustomerOrder;
import com.example.ecommerce.entity.OrderItem;
import com.example.ecommerce.entity.OrderStatus;
import com.example.ecommerce.entity.Product;
import com.example.ecommerce.entity.Role;
import com.example.ecommerce.entity.User;
import com.example.ecommerce.exception.ApiException;
import com.example.ecommerce.repository.CartItemRepository;
import com.example.ecommerce.repository.OrderRepository;
import com.example.ecommerce.repository.ProductRepository;
import com.example.ecommerce.repository.UserRepository;
import com.example.ecommerce.util.Mappers;

@Service
public class OrderService {

	// COD = cash on delivery. UPI and CARD are demo options: no real payment is taken.
	private static final Set<String> PAYMENT_METHODS = Set.of("COD", "UPI", "CARD");

	private final OrderRepository orderRepository;
	private final CartItemRepository cartItemRepository;
	private final UserRepository userRepository;
	private final ProductRepository productRepository;

	public OrderService(OrderRepository orderRepository, CartItemRepository cartItemRepository,
			UserRepository userRepository, ProductRepository productRepository) {
		this.orderRepository = orderRepository;
		this.cartItemRepository = cartItemRepository;
		this.userRepository = userRepository;
		this.productRepository = productRepository;
	}

	/**
	 * Checkout. Everything below happens in ONE transaction: if any step fails (for example
	 * the stock ran out) nothing is saved, the stock is not reduced and the cart is untouched.
	 */
	@Transactional
	public OrderDto placeOrder(Long userId, CheckoutRequest req) {
		String payment = req.paymentMethod().trim().toUpperCase();
		if (!PAYMENT_METHODS.contains(payment)) {
			throw ApiException.badRequest("Unknown payment method");
		}
		User user = userRepository.findById(userId).orElseThrow(() -> ApiException.notFound("User not found"));
		List<CartItem> cart = cartItemRepository.findByUserIdOrderByIdAsc(userId);
		if (cart.isEmpty()) {
			throw ApiException.badRequest("Your cart is empty");
		}

		CustomerOrder order = new CustomerOrder();
		order.setUser(user);
		order.setPaymentMethod(payment);
		order.setShipFullName(req.fullName().trim());
		order.setShipPhone(req.phone().trim());
		order.setShipAddress(req.addressLine().trim());
		order.setShipCity(req.city().trim());
		order.setShipState(req.state().trim());
		order.setShipPincode(req.pincode().trim());

		BigDecimal total = BigDecimal.ZERO;
		for (CartItem cartItem : cart) {
			Product product = cartItem.getProduct();
			int qty = cartItem.getQuantity();
			if (!product.isActive()) {
				throw ApiException.conflict(product.getName() + " is no longer available. Please remove it from your cart.");
			}
			if (qty > product.getStock()) {
				throw ApiException.conflict("Only " + product.getStock() + " left of " + product.getName()
						+ ". Please update your cart.");
			}
			// reduce stock (the @Version column on Product protects against two buyers at once)
			product.setStock(product.getStock() - qty);

			OrderItem item = new OrderItem();
			item.setProduct(product);
			item.setProductName(product.getName());
			item.setUnitPrice(product.getPrice());
			item.setImageUrl(product.getImageUrl());
			item.setQuantity(qty);
			order.addItem(item);

			total = total.add(product.getPrice().multiply(BigDecimal.valueOf(qty)));
		}
		order.setTotal(total);
		orderRepository.save(order);
		cartItemRepository.deleteAll(cart);
		return Mappers.orderDto(order);
	}

	@Transactional(readOnly = true)
	public List<OrderDto> myOrders(Long userId) {
		return orderRepository.findByUserIdOrderByCreatedAtDescIdDesc(userId).stream().map(Mappers::orderDto).toList();
	}

	@Transactional(readOnly = true)
	public OrderDto myOrder(Long userId, Long orderId) {
		return Mappers.orderDto(ownedOrder(userId, orderId));
	}

	/** A customer can cancel until the order has been shipped; the stock goes back to the shelf. */
	@Transactional
	public OrderDto cancel(Long userId, Long orderId) {
		CustomerOrder order = ownedOrder(userId, orderId);
		if (order.getStatus() != OrderStatus.PLACED && order.getStatus() != OrderStatus.PROCESSING) {
			throw ApiException.badRequest("This order can no longer be cancelled");
		}
		restoreStock(order);
		order.setStatus(OrderStatus.CANCELLED);
		return Mappers.orderDto(order);
	}

	// ---------- admin ----------

	@Transactional(readOnly = true)
	public List<OrderDto> allOrders() {
		return orderRepository.findAllByOrderByCreatedAtDescIdDesc().stream().map(Mappers::orderDto).toList();
	}

	@Transactional
	public OrderDto updateStatus(Long orderId, String statusText) {
		OrderStatus newStatus;
		try {
			newStatus = OrderStatus.valueOf(statusText.trim().toUpperCase());
		} catch (IllegalArgumentException ex) {
			throw ApiException.badRequest("Unknown status");
		}
		CustomerOrder order = orderRepository.findDetailedById(orderId)
				.orElseThrow(() -> ApiException.notFound("Order not found"));
		if (order.getStatus() == OrderStatus.CANCELLED) {
			throw ApiException.badRequest("A cancelled order cannot be changed");
		}
		if (newStatus == OrderStatus.CANCELLED) {
			restoreStock(order);
		}
		order.setStatus(newStatus);
		return Mappers.orderDto(order);
	}

	@Transactional(readOnly = true)
	public StatsDto stats() {
		BigDecimal revenue = orderRepository.sumTotalExcluding(OrderStatus.CANCELLED);
		return new StatsDto(productRepository.count(), orderRepository.count(),
				userRepository.countByRole(Role.CUSTOMER), revenue == null ? BigDecimal.ZERO : revenue);
	}

	// ---------- helpers ----------

	private CustomerOrder ownedOrder(Long userId, Long orderId) {
		CustomerOrder order = orderRepository.findDetailedById(orderId)
				.orElseThrow(() -> ApiException.notFound("Order not found"));
		if (!order.getUser().getId().equals(userId)) {
			throw ApiException.notFound("Order not found"); // do not reveal other people's orders
		}
		return order;
	}

	private void restoreStock(CustomerOrder order) {
		for (OrderItem item : order.getItems()) {
			Product product = item.getProduct();
			if (product != null) {
				product.setStock(product.getStock() + item.getQuantity());
			}
		}
	}
}
