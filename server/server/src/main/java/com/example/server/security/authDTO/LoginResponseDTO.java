package com.example.server.security.authDTO;

import java.util.ArrayList;
import java.util.List;

import com.example.server.security.models.Role;
import lombok.Data;

@Data
public class LoginResponseDTO {
	private String name;
	private String email;
	private List<Role> roles = new ArrayList<>();
	private String accessToken;
	private String tokenType = "Bearer ";
}
