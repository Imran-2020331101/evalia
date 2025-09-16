package com.example.server.job.Service;

import com.example.server.UserProfile.Service.UserService;
import com.example.server.job.DTO.ShortlistRequest;
import com.example.server.job.DTO.candidateInfo;
import com.example.server.security.models.userEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;
import java.util.logging.Logger;

@Service
public class JobService {

    private static final Logger logger = Logger.getLogger(JobService.class.getName());
    private final UserService userService;

    public JobService(UserService userService) {
        this.userService = userService;
    }

    public List<candidateInfo> mapToCandidateInfo(@RequestBody ShortlistRequest shortlistRequest) {
        List<candidateInfo> candidates = shortlistRequest.candidateIds().stream().map(
                candidateId -> {
                    userEntity user = userService.loadUserById(candidateId);
                    logger.info("user: " + candidateId + " " + user.getId());
                    return new candidateInfo(
                            user.getId().toString(),
                            user.getDisplayName(),
                            user.getEmail()
                    );
                }
        ).toList();

        logger.info(candidates.toString());
        return candidates;
    }
}
