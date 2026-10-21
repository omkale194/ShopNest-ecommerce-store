package com.example.ecommerce.security;

import java.io.IOException;
import java.util.List;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;

import com.example.ecommerce.repository.UserRepository;

import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/** Runs on every request: if a valid "Authorization: Bearer <token>" header is present, log the user in. */
public class JwtAuthFilter extends OncePerRequestFilter {

	private final JwtService jwtService;
	private final UserRepository userRepository;

	public JwtAuthFilter(JwtService jwtService, UserRepository userRepository) {
		this.jwtService = jwtService;
		this.userRepository = userRepository;
	}

	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
			throws ServletException, IOException {

		String header = request.getHeader("Authorization");
		if (header != null && header.startsWith("Bearer ")
				&& SecurityContextHolder.getContext().getAuthentication() == null) {
			try {
				String email = jwtService.extractEmail(header.substring(7));
				userRepository.findByEmail(email).ifPresent(user -> {
					UserPrincipal principal = new UserPrincipal(user.getId(), user.getEmail(), user.getName(),
							user.getRole().name());
					UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(principal, null,
							List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name())));
					auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
					SecurityContextHolder.getContext().setAuthentication(auth);
				});
			} catch (JwtException | IllegalArgumentException ex) {
				// bad or expired token: carry on as an anonymous visitor (protected URLs will answer 401)
			}
		}
		chain.doFilter(request, response);
	}
}
