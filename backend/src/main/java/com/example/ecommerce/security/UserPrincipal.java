package com.example.ecommerce.security;

/** The logged-in user as seen by the controllers (read from the JWT token). */
public record UserPrincipal(Long id, String email, String name, String role) {
}
