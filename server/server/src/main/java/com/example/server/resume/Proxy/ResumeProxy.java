package com.example.server.resume;

import com.example.server.resume.Config.FeignMultipartSupportConfig;
import com.example.server.resume.DTO.ResumeDataRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.multipart.MultipartFile;

@FeignClient(name = "aiClient",
        url = "http://localhost:5000/api/resume",
        configuration = FeignMultipartSupportConfig.class)
public interface ResumeProxy {

    @PostMapping(
            value = "/upload",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE )
    String forwardResumeToProcessingEngine(
            @RequestPart("file") MultipartFile file,@RequestPart("userEmail") String userEmail);


    @PostMapping(value = "/save", consumes = MediaType.APPLICATION_JSON_VALUE)
    String saveResume(@RequestBody ResumeDataRequest resumeData);

}

