package com.example.server.exception.handler;

import com.example.server.UserProfile.exception.OrganizationNotFoundException;
import com.example.server.exception.CustomExceptions.*;
import com.example.server.job.exception.InvalidJobStatusException;
import com.example.server.job.exception.JobClosedException;
import com.example.server.job.exception.JobNotFoundException;
import com.example.server.resume.exception.ResumeNotFoundException;
import com.example.server.resume.exception.ResumeParsingException;
import com.example.server.security.exception.*;
import jakarta.mail.MessagingException;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockHttpServletRequest;

import java.util.function.BiFunction;
import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.assertThat;

class GlobalExceptionHandlerTest {

    private GlobalExceptionHandler handler;
    private HttpServletRequest request;

    @BeforeEach
    void setUp() {
        handler = new GlobalExceptionHandler();
        request = new MockHttpServletRequest("GET", "/api/some/path");
    }

    private static Arguments c(BiFunction<GlobalExceptionHandler, HttpServletRequest, ResponseEntity<ExceptionResponse>> call,
                               HttpStatus status) {
        return Arguments.of(call, status);
    }

    static Stream<Arguments> handlers() {
        return Stream.of(
                c((h, r) -> h.handleResourceNotFound(new ResourceNotFoundException("m"), r), HttpStatus.NOT_FOUND),
                c((h, r) -> h.handleDuplicate(new DuplicateResourceException("m"), r), HttpStatus.CONFLICT),
                c((h, r) -> h.handleInvalidRequest(new InvalidRequestException("m"), r), HttpStatus.BAD_REQUEST),
                c((h, r) -> h.handleOperationNotAllowed(new OperationNotAllowedException("m"), r), HttpStatus.FORBIDDEN),
                c((h, r) -> h.handleJobNotFound(new JobNotFoundException("m"), r), HttpStatus.NOT_FOUND),
                c((h, r) -> h.handleJobClosed(new JobClosedException("m"), r), HttpStatus.BAD_REQUEST),
                c((h, r) -> h.handleInvalidJobStatus(new InvalidJobStatusException("m"), r), HttpStatus.BAD_REQUEST),
                c((h, r) -> h.handleResumeNotFound(new ResumeNotFoundException("m"), r), HttpStatus.NOT_FOUND),
                c((h, r) -> h.handleResumeParsing(new ResumeParsingException("m"), r), HttpStatus.INTERNAL_SERVER_ERROR),
                c((h, r) -> h.handleUserNotFound(new UserNotFoundException("m"), r), HttpStatus.NOT_FOUND),
                c((h, r) -> h.handleUserExists(new UserAlreadyExistsException("m"), r), HttpStatus.CONFLICT),
                c((h, r) -> h.handleInvalidCredentials(new InvalidUserCredentialsException("m"), r), HttpStatus.UNAUTHORIZED),
                c((h, r) -> h.handleUnauthorized(new UnauthorizedException("m"), r), HttpStatus.UNAUTHORIZED),
                c((h, r) -> h.handleAccessDenied(new AccessDeniedException("m"), r), HttpStatus.FORBIDDEN),
                c((h, r) -> h.handleTokenExpired(new TokenExpiredException("m"), r), HttpStatus.UNAUTHORIZED),
                c((h, r) -> h.handleInvalidToken(new InvalidTokenException("m"), r), HttpStatus.BAD_REQUEST),
                c((h, r) -> h.handleMessagingException(new MessagingException("m"), r), HttpStatus.SERVICE_UNAVAILABLE)
        );
    }

    @ParameterizedTest
    @MethodSource("handlers")
    void mapsExceptionToStatusAndBody(
            BiFunction<GlobalExceptionHandler, HttpServletRequest, ResponseEntity<ExceptionResponse>> call,
            HttpStatus expected) {

        ResponseEntity<ExceptionResponse> response = call.apply(handler, request);

        assertThat(response.getStatusCode()).isEqualTo(expected);
        ExceptionResponse body = response.getBody();
        assertThat(body).isNotNull();
        assertThat(body.getStatus()).isEqualTo(expected.value());
        assertThat(body.getError()).isEqualTo(expected.getReasonPhrase());
        assertThat(body.getMessage()).isEqualTo("m");
        assertThat(body.getPath()).isEqualTo("/api/some/path");
        assertThat(body.getTimestamp()).isNotNull();
    }

    @Test
    void fallbackHidesInternalDetails() {
        ResponseEntity<ExceptionResponse> response =
                handler.handleGeneral(new IllegalStateException("secret internals"), request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
        assertThat(response.getBody().getMessage()).isEqualTo("Unexpected error occurred");
        assertThat(response.getBody().getPath()).isEqualTo("/api/some/path");
    }

    @Test
    void organizationNotFoundHasNoDedicatedHandlerSoItFallsThrough() {
        // OrganizationNotFoundException is not mapped explicitly; it would hit the generic 500 handler.
        // (Reported as a finding: arguably it should be a 404.)
        ResponseEntity<ExceptionResponse> response =
                handler.handleGeneral(new OrganizationNotFoundException("no org"), request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
