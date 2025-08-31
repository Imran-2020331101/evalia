package com.example.server.resume.DTO;

import lombok.Data;
import org.bson.types.ObjectId;

@Data
public class ResumeForwardWrapper {
    private ResumeDataRequest resumeData;
    private String resumeURL;
    private String userId;
    private String userName;
    private String userEmail;

    public ResumeForwardWrapper(ResumeDataRequest resumeData,String resumeURL, ObjectId id, String userName, String userEmail) {
        this.resumeData = resumeData;
        this.resumeURL = resumeURL;
        this.userId = id.toString();
        this.userName = userName;
        this.userEmail = userEmail;
    }

}
