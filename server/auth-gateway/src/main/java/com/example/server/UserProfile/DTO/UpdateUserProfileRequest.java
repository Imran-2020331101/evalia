package com.example.server.UserProfile.DTO;

import lombok.Data;

@Data
public class UpdateUserProfileRequest {
    private String name;
    private String bio;
    private String location;
    private String aboutMe;
}
