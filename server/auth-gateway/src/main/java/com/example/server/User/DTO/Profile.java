package com.example.server.User.DTO;

import com.example.server.resume.DTO.ResumeDataRequest;
import com.example.server.security.models.userEntity;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Profile {
    private ResumeDataRequest resumeData;
    private UserDTO user;
}
