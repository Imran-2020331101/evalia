package com.example.server.job.exception;

public class JobClosedException extends RuntimeException{
    public JobClosedException(String message) {
        super(message);
    }
}
