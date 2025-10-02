package com.clinprecision.userservice.security;

import java.io.IOException;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Date;

import javax.crypto.SecretKey;

import com.clinprecision.common.dto.UserDto;
import com.clinprecision.common.dto.UserTypeDto;
import org.springframework.core.env.Environment;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.clinprecision.userservice.service.UsersService;
import com.clinprecision.userservice.ui.model.LoginRequestModel;
import com.fasterxml.jackson.databind.ObjectMapper;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SecureDigestAlgorithm;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public class AuthenticationFilter extends UsernamePasswordAuthenticationFilter {

	private UsersService usersService;
	private Environment environment;

	public AuthenticationFilter(UsersService usersService, Environment environment,
			AuthenticationManager authenticationManager) {
		super(authenticationManager);
		this.usersService = usersService;
		this.environment = environment;
	}

	@Override
	public Authentication attemptAuthentication(HttpServletRequest req, HttpServletResponse res)
			throws AuthenticationException {
		try {
			LoginRequestModel creds = new ObjectMapper().readValue(req.getInputStream(), LoginRequestModel.class);
			return getAuthenticationManager().authenticate(
				new UsernamePasswordAuthenticationToken(creds.getEmail(), creds.getPassword(), new ArrayList<>()));
		} catch (IOException e) {
			throw new RuntimeException(e);
		}
	}

	@Override
	protected void successfulAuthentication(HttpServletRequest req, HttpServletResponse res, FilterChain chain,
			Authentication auth) throws IOException, ServletException {

		String userName = ((User) auth.getPrincipal()).getUsername();
		UserDto userDetails = usersService.getUserDetailsByEmail(userName);
		
		String tokenSecret = environment.getProperty("token.secret");
        SecretKey key = Keys.hmacShaKeyFor(tokenSecret.getBytes());
        SecureDigestAlgorithm<SecretKey, ?> algorithm = Jwts.SIG.HS512;

		Instant now = Instant.now();
		String userRole = usersService.getUserRole(userDetails.getId());

		String token = Jwts.builder()
				.claim("scope", auth.getAuthorities())
				.claim("authorities", auth.getAuthorities()) // Add authorities explicitly
				.claim("email", userName) // Add email to the token
				.claim("role", userRole) // Add role to the token
				.subject(userDetails.getUserId())
				.expiration(
						Date.from(now.plusMillis(Long.parseLong(environment.getProperty("token.expiration_time")))))
				.issuedAt(Date.from(now)).signWith(key, algorithm).compact();

		res.addHeader("token", token);
		res.addHeader("userId", userDetails.getUserId());
		res.addHeader("userEmail", userName);
		res.addHeader("userRole", userRole);
		
		// Add Access-Control-Expose-Headers to make custom headers available to the client
		res.addHeader("Access-Control-Expose-Headers", "token, userId, userEmail, userRole");
	}
	
	@Override
	protected void unsuccessfulAuthentication(HttpServletRequest request, HttpServletResponse response,
			AuthenticationException failed) throws IOException, ServletException {
		super.unsuccessfulAuthentication(request, response, failed);
	}
}
