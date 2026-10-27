package com.example.server.support;

import com.sun.net.httpserver.HttpServer;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.InetAddress;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CopyOnWriteArrayList;

/** Tiny in-JVM HTTP server (JDK built-in) that records requests and replies with a canned response. */
public class FakeHttpServer implements AutoCloseable {

    /** A request as seen by the server. */
    public record Recorded(String method, String path, String query, String contentType, String body,
                           Map<String, List<String>> headers) {
    }

    private final HttpServer server;
    private final List<Recorded> requests = new CopyOnWriteArrayList<>();
    private volatile int status = 200;
    private volatile String responseBody = "";
    private volatile String responseContentType = "application/json";

    public FakeHttpServer() {
        try {
            server = HttpServer.create(new InetSocketAddress(InetAddress.getLoopbackAddress(), 0), 0);
        } catch (IOException e) {
            throw new IllegalStateException(e);
        }
        server.createContext("/", exchange -> {
            try (InputStream in = exchange.getRequestBody()) {
                String body = new String(in.readAllBytes(), StandardCharsets.UTF_8);
                requests.add(new Recorded(
                        exchange.getRequestMethod(),
                        exchange.getRequestURI().getPath(),
                        exchange.getRequestURI().getRawQuery(),
                        exchange.getRequestHeaders().getFirst("Content-Type"),
                        body,
                        Map.copyOf(exchange.getRequestHeaders())));
            }
            byte[] bytes = responseBody.getBytes(StandardCharsets.UTF_8);
            exchange.getResponseHeaders().add("Content-Type", responseContentType);
            exchange.sendResponseHeaders(status, bytes.length == 0 ? -1 : bytes.length);
            if (bytes.length > 0) {
                try (OutputStream out = exchange.getResponseBody()) {
                    out.write(bytes);
                }
            }
            exchange.close();
        });
        server.start();
    }

    public int port() {
        return server.getAddress().getPort();
    }

    public String baseUrl() {
        return "http://localhost:" + port();
    }

    /** Sets the canned response and clears recorded requests. */
    public void reply(int status, String body) {
        this.status = status;
        this.responseBody = body;
        this.requests.clear();
    }

    public Recorded lastRequest() {
        if (requests.isEmpty()) {
            throw new AssertionError("no request reached the fake server");
        }
        return requests.get(requests.size() - 1);
    }

    public int requestCount() {
        return requests.size();
    }

    @Override
    public void close() {
        server.stop(0);
    }
}
