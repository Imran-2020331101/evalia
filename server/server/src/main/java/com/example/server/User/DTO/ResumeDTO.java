package com.example.server.User.DTO;

import lombok.Data;

import java.util.Date;
import java.util.List;
import java.util.Map;

@Data
public class ResumeDTO {

    private String filename;
    private String originalName;
    private String fileLink;

    private Metadata metadata;

    private String industry;

    private Analysis analysis;
    private Skills skills;
    private List<Experience> experience;
    private List<Education> education;
    private List<Project> projects;
    private List<Certification> certifications;
    private List<Award> awards;
    private List<String> volunteer;
    private List<String> interests;

    private Contact contact;

    private String uploadedBy;
    private Date uploadedAt;
    private Date processedAt;
    private String status;

    // ---- Inner DTO classes ---- //

    @Data
    public static class Metadata {
        private Integer pages;
        private Map<String, Object> info;
        private String version;
    }

    @Data
    public static class Analysis {
        private Integer wordCount;
        private Integer characterCount;
        private Boolean hasEmail;
        private Boolean hasPhone;
        private List<String> sections;
        private List<String> keywords;
    }

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
    public static class Award {
        private String title;
        private String organization;
        private String year;
        private String description;
    }

    @Data
    public static class Contact {
        private String email;
        private String phone;
        private String linkedin;
        private String github;
        private String location;
    }
}
