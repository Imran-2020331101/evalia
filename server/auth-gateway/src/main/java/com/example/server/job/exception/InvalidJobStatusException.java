package com.example.server.job.exception;

public class InvalidJobStatusException extends RuntimeException{
    public InvalidJobStatusException(String message) {
        super(message);
    }
}
