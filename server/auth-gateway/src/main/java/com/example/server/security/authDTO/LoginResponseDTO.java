package com.example.server.security.authDTO;

import java.util.ArrayList;
import java.util.List;

import com.example.server.security.models.Role;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class LoginResponseDTO {
	private String name;
	private String email;
	private List<Role> roles = new ArrayList<>();
	private String accessToken;
	private String tokenType = "Bearer ";

	public LoginResponseDTO(String name, String email, List<Role> roles, String accessToken) {
		this.name = name;
		this.email = email;
		this.roles = roles;
		this.accessToken = accessToken;
	}
}
