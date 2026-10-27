package com.example.server.UserProfile.Config;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;

@Configuration
public class CloudinaryConfig {

    private final Environment env;

    public CloudinaryConfig(Environment env) {
        this.env = env;
    }

    @Bean
    public Cloudinary cloudinary() {
        return new Cloudinary(ObjectUtils.asMap(
                "cloud_name", env.getProperty("CLOUDINARY_CLOUD_NAME"),
                "api_key", env.getProperty("CLOUDINARY_API_KEY"),
                "api_secret", env.getProperty("CLOUDINARY_API_SECRET")
        ));
    }
}