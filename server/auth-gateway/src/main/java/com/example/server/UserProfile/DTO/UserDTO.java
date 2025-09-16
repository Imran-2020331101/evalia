package com.example.server.UserProfile.DTO;

import lombok.Data;
import org.bson.types.ObjectId;

import java.util.List;

@Data
public class UserDTO {
    private String id;
    private String name;
    private String email;
    private boolean emailVerified;
    private List<String> roles;
    private String bio;
    private String location;
    private String aboutMe;
    private String profilePictureUrl;
    private String coverPictureUrl;
    private boolean hasResume;
    private String resumeUrl;
    private boolean hasAnyOrganization;
    private List<String> organizations;
    private String provider;
}

