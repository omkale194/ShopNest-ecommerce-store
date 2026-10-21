package com.example.ecommerce.web;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.ecommerce.dto.Dtos.AuthResponse;
import com.example.ecommerce.dto.Dtos.LoginRequest;
import com.example.ecommerce.dto.Dtos.RegisterRequest;
import com.example.ecommerce.dto.Dtos.UserDto;
import com.example.ecommerce.security.UserPrincipal;
import com.example.ecommerce.service.AuthService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

	private final AuthService authService;

	public AuthController(AuthService authService) {
		this.authService = authService;
	}

	@PostMapping("/register")
	public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
		return authService.register(request);
	}

	@PostMapping("/login")
	public AuthResponse login(@Valid @RequestBody LoginRequest request) {
		return authService.login(request);
	}

	@GetMapping("/me")
	public UserDto me(@AuthenticationPrincipal UserPrincipal me) {
		return authService.me(me.id());
	}
}
