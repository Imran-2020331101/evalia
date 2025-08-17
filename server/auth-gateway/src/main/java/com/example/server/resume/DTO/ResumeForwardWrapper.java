package com.example.server.resume.DTO;

import lombok.Data;
import org.bson.types.ObjectId;

@Data
public class ResumeForwardWrapper {
    private ResumeDataRequest resumeData;
    private String userId;
    private String userName;

    public ResumeForwardWrapper(ResumeDataRequest resumeData, ObjectId id, String userName) {
        this.resumeData = resumeData;
        this.userId = id.toString();
        this.userName = userName;
    }

}
