package com.example.server.job.Proxy;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "compatibilityClient",
             url  = "${job.service.url}/api/compatibility")
public interface CompatibilityProxy {
    @GetMapping("/{reviewId}")
    ResponseEntity<String> getCompatibilityReviewById(@PathVariable("reviewId") String reviewId);
}
