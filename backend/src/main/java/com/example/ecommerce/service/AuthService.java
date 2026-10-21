package com.example.ecommerce.service;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.ecommerce.dto.Dtos.AuthResponse;
import com.example.ecommerce.dto.Dtos.LoginRequest;
import com.example.ecommerce.dto.Dtos.RegisterRequest;
import com.example.ecommerce.dto.Dtos.UserDto;
import com.example.ecommerce.entity.Role;
import com.example.ecommerce.entity.User;
import com.example.ecommerce.exception.ApiException;
import com.example.ecommerce.repository.UserRepository;
import com.example.ecommerce.security.JwtService;
import com.example.ecommerce.util.Mappers;

@Service
public class AuthService {

	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;
	private final JwtService jwtService;

	public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
		this.jwtService = jwtService;
	}

	@Transactional
	public AuthResponse register(RegisterRequest req) {
		String email = req.email().trim().toLowerCase();
		if (userRepository.existsByEmail(email)) {
			throw ApiException.conflict("An account with this email already exists");
		}
		User user = new User();
		user.setName(req.name().trim());
		user.setEmail(email);
		user.setPassword(passwordEncoder.encode(req.password()));
		user.setRole(Role.CUSTOMER); // everyone who registers is a customer, never an admin
		userRepository.save(user);
		return new AuthResponse(jwtService.generateToken(user), Mappers.userDto(user));
	}

	@Transactional(readOnly = true)
	public AuthResponse login(LoginRequest req) {
		String email = req.email().trim().toLowerCase();
		User user = userRepository.findByEmail(email)
				.filter(u -> passwordEncoder.matches(req.password(), u.getPassword()))
				.orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Invalid email or password"));
		return new AuthResponse(jwtService.generateToken(user), Mappers.userDto(user));
	}

	@Transactional(readOnly = true)
	public UserDto me(Long userId) {
		return userRepository.findById(userId).map(Mappers::userDto)
				.orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Please log in again"));
	}
}
