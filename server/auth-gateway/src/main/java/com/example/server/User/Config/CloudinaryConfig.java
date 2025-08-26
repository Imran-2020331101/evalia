package com.example.server.User.Config;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class CloudinaryConfig {

    @Bean
    public Cloudinary cloudinary() {
        return new Cloudinary(ObjectUtils.asMap(
                "cloud_name", "dzfshqxkp",
                "api_key", "331625761167468",
                "api_secret", "1JgnjJVGh2NT3uGN__8oWyg56S8"
        ));
    }
}