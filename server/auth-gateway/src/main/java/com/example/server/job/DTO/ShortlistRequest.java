package com.example.server.job.DTO;

import java.util.List;

public record ShortlistRequest(List<String> candidateIds) {
}
