package com.example.server.resume.DTO;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

import java.util.Date;
import java.util.List;
import java.util.Map;

@Data
public class ResumeDataRequest {

    private String filename;
    private String originalName;
    private String fileLink;
    private String industry;

    private Skills skills;
    private List<Experience> experience;
    private List<Education> education;
    private List<Project> projects;
    private List<Certification> certifications;
    private List<Award> awards;
    private List<String> volunteer;
    private List<String> interests;
    private Contact contact;

    private String status;

    private String downloadUrl;
    private Metadata metadata;
    private Analysis analysis;
    private String uploadedBy;
    private Date processedAt;

    // Inner DTO Classes
    @Data
    public static class Skills {
        private List<String> technical;
        private List<String> soft;
        private List<String> languages;
        private List<String> tools;
        private List<String> other;

    }

    @Data
    public static class Experience {
        private String job_title;
        private String company;
        private String duration;
        private List<String> description;
        private List<String> achievements;

    }

    @Data
    public static class Education {
        private String degree;
        private String institution;
        private String year;
        private String gpa;

    }

    @Data
    public static class Project {
        private String title;
        private String description;
        private List<String> technologies;
        private String url;

    }

    @Data
    public static class Certification {
        private String title;
        private String provider;
        private String date;
        private String link;

    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Award {
        private String title;
        private String organization;
        private String year;
        private String description;
        private String _id; // <--- add this field
    }

    @Data
    public static class Contact {
        private String email;
        private String phone;
        private String linkedin;
        private String github;
        private String location;

    }

    @Data
    public static class Metadata {
        private int pages;
        private Map<String, Object> info;
        private String version;

    }

    @Data
    public static class Analysis {
        private int wordCount;
        private int characterCount;
        private boolean hasEmail;
        private boolean hasPhone;
        private List<String> sections;
        private List<String> keywords;

    }

}
