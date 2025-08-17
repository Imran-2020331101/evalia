package com.example.server.security.models;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DocumentReference;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

@Document(collection = "users")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class userEntity implements UserDetails {
    @Id
    private ObjectId id;
    private String name;
    @Getter
    private String email;
    private String password;

    private List<Role> roles = new ArrayList<>();
    private boolean emailVerified = false;
    private boolean hasResume = false;

    // OAuth2 related fields
    private String provider; // "github", "google", etc.
    private String providerId; // User ID from the OAuth2 provider
    private boolean enabled = false; // Account enabled status
    private String username; // Username for authentication

    @Override
    public String toString() {
        return id + " " + email;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return roles.stream()
                .map(role -> new SimpleGrantedAuthority(role.getName()))
                .collect(Collectors.toList());
    }

    @Override
    public String getPassword() {
        return this.password;
    }

    @Override
    public String getUsername() {
        // Return email as username if username is not set
        return username != null ? username : email;
    }

    /**
     * Get the display name of the user.
     * This is different from getUsername() which returns email for Spring Security
     * authentication.
     * 
     * @return The user's name for display purposes
     */
    public String getDisplayName() {
        return this.name;
    }
	
	@Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        // For OAuth2 users, check the enabled flag
        // For email users, check if email is verified
        if (provider != null && !provider.isEmpty()) {
            return enabled;
        }
        return emailVerified;
    }
}
