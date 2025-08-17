package com.example.server.resume.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BasicSearchResponse {
    private boolean success;
    private List<Candidate> candidates;
    private String message;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Candidate {
        private String id;
        private String name;
        private String email;
        private Skills skills;
        private Experience experience;
        private Projects projects;
        private Education education;
        private double totalScore;

        @Data
        @NoArgsConstructor
        @AllArgsConstructor
        public static class Skills {
            private double score;
            private List<Object> details;
        }

        @Data
        @NoArgsConstructor
        @AllArgsConstructor
        public static class Experience {
            private double score;
            private int years;
            private List<Object> companies;
        }

        @Data
        @NoArgsConstructor
        @AllArgsConstructor
        public static class Projects {
            private double score;
            private int count;
            private List<Object> projects;
        }

        @Data
        @NoArgsConstructor
        @AllArgsConstructor
        public static class Education {
            private double score;
            private String degree;
            private String institution;
            private double gpa;
        }
    }
}

