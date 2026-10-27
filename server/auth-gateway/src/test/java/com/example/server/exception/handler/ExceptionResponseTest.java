package com.example.server.exception.handler;

import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

class ExceptionResponseTest {

    @Test
    void constructorSetsFieldsAndTimestamp() {
        LocalDateTime before = LocalDateTime.now().minusSeconds(1);

        ExceptionResponse response = new ExceptionResponse(404, "Not Found", "missing", "/api/x");

        assertThat(response.getStatus()).isEqualTo(404);
        assertThat(response.getError()).isEqualTo("Not Found");
        assertThat(response.getMessage()).isEqualTo("missing");
        assertThat(response.getPath()).isEqualTo("/api/x");
        assertThat(response.getTimestamp()).isAfter(before).isBeforeOrEqualTo(LocalDateTime.now());
    }

    @Test
    void settersAndEqualsFromLombokData() {
        ExceptionResponse a = new ExceptionResponse(400, "Bad Request", "m", "/p");
        ExceptionResponse b = new ExceptionResponse(400, "Bad Request", "m", "/p");
        b.setTimestamp(a.getTimestamp());

        assertThat(a).isEqualTo(b).hasSameHashCodeAs(b);
        b.setMessage("other");
        assertThat(a).isNotEqualTo(b);
        assertThat(a.toString()).contains("Bad Request");
    }
}
