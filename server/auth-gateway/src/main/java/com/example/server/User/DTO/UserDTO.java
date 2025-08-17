package com.example.server.User.DTO;

import lombok.Data;
import org.bson.types.ObjectId;

import java.util.List;

@Data
public class UserDTO {
    private ObjectId id;
    private String name;
    private String email;
    private List<String> roles;
    private boolean emailVerified;
    private boolean hasResume;
    private String provider;
}

