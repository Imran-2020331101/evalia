package com.example.server.job.Controller;

import com.example.server.job.Proxy.CompatibilityProxy;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/compatibility")
public class CompatibilityController {

    private final CompatibilityProxy compatibilityProxy;

    public CompatibilityController(CompatibilityProxy compatibilityProxy) {
        this.compatibilityProxy = compatibilityProxy;
    }


    @GetMapping("/{reviewId}")
    public ResponseEntity<String> getCompatibilityReviewById(@PathVariable String reviewId) {

        ResponseEntity<String> response = compatibilityProxy.getCompatibilityReviewById(reviewId);
        return ResponseEntity.status(response.getStatusCode())
                .body(response.getBody());
    }
}
