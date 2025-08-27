package com.example.server.exception.handler;

import com.example.server.exception.CustomExceptions.*;
import com.example.server.job.exception.InvalidJobStatusException;
import com.example.server.job.exception.JobClosedException;
import com.example.server.job.exception.JobNotFoundException;
import com.example.server.resume.exception.ResumeNotFoundException;
import com.example.server.resume.exception.ResumeParsingException;
import com.example.server.security.exception.*;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;


@RestControllerAdvice
public class GlobalExceptionHandler {

    // Utility method to reduce repetition
    private ResponseEntity<ExceptionResponse> buildResponse(HttpStatus status, String message, HttpServletRequest request) {
        return new ResponseEntity<>(
                new ExceptionResponse(status.value(), status.getReasonPhrase(), message, request.getRequestURI()),
                status
        );
    }

    // 🔹 Common exceptions
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ExceptionResponse> handleResourceNotFound(ResourceNotFoundException ex, HttpServletRequest req) {
        return buildResponse(HttpStatus.NOT_FOUND, ex.getMessage(), req);
    }

    @ExceptionHandler(DuplicateResourceException.class)
    public ResponseEntity<ExceptionResponse> handleDuplicate(DuplicateResourceException ex, HttpServletRequest req) {
        return buildResponse(HttpStatus.CONFLICT, ex.getMessage(), req);
    }

    @ExceptionHandler(InvalidRequestException.class)
    public ResponseEntity<ExceptionResponse> handleInvalidRequest(InvalidRequestException ex, HttpServletRequest req) {
        return buildResponse(HttpStatus.BAD_REQUEST, ex.getMessage(), req);
    }

    @ExceptionHandler(OperationNotAllowedException.class)
    public ResponseEntity<ExceptionResponse> handleOperationNotAllowed(OperationNotAllowedException ex, HttpServletRequest req) {
        return buildResponse(HttpStatus.FORBIDDEN, ex.getMessage(), req);
    }

    // 🔹 Job exceptions
    @ExceptionHandler(JobNotFoundException.class)
    public ResponseEntity<ExceptionResponse> handleJobNotFound(JobNotFoundException ex, HttpServletRequest req) {
        return buildResponse(HttpStatus.NOT_FOUND, ex.getMessage(), req);
    }

    @ExceptionHandler(JobClosedException.class)
    public ResponseEntity<ExceptionResponse> handleJobClosed(JobClosedException ex, HttpServletRequest req) {
        return buildResponse(HttpStatus.BAD_REQUEST, ex.getMessage(), req);
    }

    @ExceptionHandler(InvalidJobStatusException.class)
    public ResponseEntity<ExceptionResponse> handleInvalidJobStatus(InvalidJobStatusException ex, HttpServletRequest req) {
        return buildResponse(HttpStatus.BAD_REQUEST, ex.getMessage(), req);
    }

    // 🔹 Resume exceptions
    @ExceptionHandler(ResumeNotFoundException.class)
    public ResponseEntity<ExceptionResponse> handleResumeNotFound(ResumeNotFoundException ex, HttpServletRequest req) {
        return buildResponse(HttpStatus.NOT_FOUND, ex.getMessage(), req);
    }

    @ExceptionHandler(ResumeParsingException.class)
    public ResponseEntity<ExceptionResponse> handleResumeParsing(ResumeParsingException ex, HttpServletRequest req) {
        return buildResponse(HttpStatus.INTERNAL_SERVER_ERROR, ex.getMessage(), req);
    }

    // 🔹 User exceptions
    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<ExceptionResponse> handleUserNotFound(UserNotFoundException ex, HttpServletRequest req) {
        return buildResponse(HttpStatus.NOT_FOUND, ex.getMessage(), req);
    }

    @ExceptionHandler(UserAlreadyExistsException.class)
    public ResponseEntity<ExceptionResponse> handleUserExists(UserAlreadyExistsException ex, HttpServletRequest req) {
        return buildResponse(HttpStatus.CONFLICT, ex.getMessage(), req);
    }

    @ExceptionHandler(InvalidUserCredentialsException.class)
    public ResponseEntity<ExceptionResponse> handleInvalidCredentials(InvalidUserCredentialsException ex, HttpServletRequest req) {
        return buildResponse(HttpStatus.UNAUTHORIZED, ex.getMessage(), req);
    }

    // 🔹 Security exceptions
    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<ExceptionResponse> handleUnauthorized(UnauthorizedException ex, HttpServletRequest req) {
        return buildResponse(HttpStatus.UNAUTHORIZED, ex.getMessage(), req);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ExceptionResponse> handleAccessDenied(AccessDeniedException ex, HttpServletRequest req) {
        return buildResponse(HttpStatus.FORBIDDEN, ex.getMessage(), req);
    }

    @ExceptionHandler(TokenExpiredException.class)
    public ResponseEntity<ExceptionResponse> handleTokenExpired(TokenExpiredException ex, HttpServletRequest req) {
        return buildResponse(HttpStatus.UNAUTHORIZED, ex.getMessage(), req);
    }

    @ExceptionHandler(InvalidTokenException.class)
    public ResponseEntity<ExceptionResponse> handleInvalidToken(InvalidTokenException ex, HttpServletRequest req) {
        return buildResponse(HttpStatus.BAD_REQUEST, ex.getMessage(), req);
    }

    // 🔹 Fallback - catches anything not handled above
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ExceptionResponse> handleGeneral(Exception e, HttpServletRequest req) {
        return buildResponse(HttpStatus.INTERNAL_SERVER_ERROR, "Unexpected error occurred", req);
    }
}
