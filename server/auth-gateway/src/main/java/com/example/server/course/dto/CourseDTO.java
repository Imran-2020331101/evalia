package com.example.server.course.dto;

import lombok.Data;

import java.util.Date;

@Data
public class CourseDTO {
    private String videoId;
    private String title;
    private String description;
    private String channelId;
    private String channelTitle;
    private ThumbnailsDTO thumbnails;
    private Date publishedAt;

    @Data
    public static class ThumbnailsDTO {
        private ThumbnailDetail defaultThumbnail;
        private ThumbnailDetail medium;
        private ThumbnailDetail high;

        @Data
        public static class ThumbnailDetail {
            private String url;
            private Integer width;
            private Integer height;
        }
    }
}
