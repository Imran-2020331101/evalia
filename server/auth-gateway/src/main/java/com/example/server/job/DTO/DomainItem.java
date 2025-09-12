package com.example.server.job.DTO;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DomainItem {
    @NotNull
    String type;
    @NotBlank
    String category;
    @NotBlank
    String description;
}
