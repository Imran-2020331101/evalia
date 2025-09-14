package com.example.server.job.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TranscriptWrapperDTO {
    private List<TranscriptDTO> transcript;
}
