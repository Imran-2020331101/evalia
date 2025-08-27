package com.example.server.security.exception;

public class InvalidUserCredentialsException extends RuntimeException{
    public InvalidUserCredentialsException(String message) {
        super(message);
    }
}
