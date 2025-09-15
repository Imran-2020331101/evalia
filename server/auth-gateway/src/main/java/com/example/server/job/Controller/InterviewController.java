package com.example.server.job.Controller;

import com.example.server.job.DTO.TranscriptDTO;
import com.example.server.job.DTO.TranscriptWrapperDTO;
import com.example.server.job.Proxy.InterviewProxy;
import com.example.server.job.Proxy.JobProxy;
import com.example.server.security.models.userEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.logging.Logger;

@CrossOrigin
@RestController
@RequestMapping("/api/interviews")
public class InterviewController {    

    private static final Logger logger = Logger.getLogger(InterviewController.class.getName());
    private final InterviewProxy interviewProxy;
    private final UserDetailsService userDetailsService;

    public InterviewController(InterviewProxy interviewProxy, UserDetailsService userDetailsService) {
        this.interviewProxy = interviewProxy;
        this.userDetailsService = userDetailsService;
    }

    @GetMapping("/")
    private ResponseEntity<?> getAllInterviewsOfAUser( Principal principal ) {

        userEntity user = (userEntity) userDetailsService.loadUserByUsername(principal.getName());

        ResponseEntity<String> response = interviewProxy.getAllInterviewsOfAUser(user.getId().toString());
        return ResponseEntity.status(response.getStatusCode())
                .body(response.getBody());
    }

    @GetMapping("/{interviewId}")
    private ResponseEntity<String> getInterviewById(@PathVariable("interviewId") String interviewId) {
        ResponseEntity<String> response = interviewProxy.getInterviewById(interviewId);
        return ResponseEntity.status(response.getStatusCode())
                .body(response.getBody());
    }

    @PostMapping("/{interviewId}/transcript")
    private ResponseEntity<String> addTranscriptToInterview(@PathVariable("interviewId") String interviewId,
                                                            @RequestBody TranscriptWrapperDTO transcript) {
        logger.info("Received transcript for interview ID: " + transcript.getTranscript().get(0));
        ResponseEntity<String> response = interviewProxy.addTranscriptToInterview(interviewId, transcript);
        return ResponseEntity.status(response.getStatusCode())
                .body(response.getBody());
    }

    @GetMapping("/{interviewId}/evaluation")
    private ResponseEntity<String> getEvaluationOfAnInterview(@PathVariable("interviewId") String interviewId) {
        ResponseEntity<String> response = interviewProxy.getEvaluationOfAnInterview(interviewId);
        return ResponseEntity.status(response.getStatusCode())
                .body(response.getBody());
    }
}
