package com.carrental.lucene;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;

import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.util.List;

public class LuceneServer {

    public static void main(String[] args) throws Exception {
        Path pdfFolder = Path.of("/home/ice003/ProiectIII/CarRentalProject/client/public/pdfs");
        Path indexFolder = Path.of("index-data");

        PdfIndexer indexer = new PdfIndexer(pdfFolder, indexFolder);
        indexer.buildIndex();

        System.out.println("Lucene index built.");

        PdfSearcher searcher = new PdfSearcher(indexFolder);

        HttpServer server = HttpServer.create(new InetSocketAddress(8080), 0);

        server.createContext("/search", (HttpExchange exchange) -> {
            String origin = exchange.getRequestHeaders().getFirst("Origin");

            if ("http://localhost:5173".equals(origin) ||
                    "http://127.0.0.1:5173".equals(origin)) {
                exchange.getResponseHeaders().add("Access-Control-Allow-Origin", origin);
            }

            exchange.getResponseHeaders().add("Access-Control-Allow-Methods", "GET, OPTIONS");
            exchange.getResponseHeaders().add("Access-Control-Allow-Headers", "Content-Type");

            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }

            URI requestURI = exchange.getRequestURI();
            String query = requestURI.getQuery();

            String q = "";
            boolean asc = false;

            if (query != null) {
                for (String param : query.split("&")) {
                    String[] pair = param.split("=", 2);

                    if (pair.length == 2) {
                        if ("q".equals(pair[0])) {
                            q = URLDecoder.decode(pair[1], StandardCharsets.UTF_8);
                        }

                        if ("sort".equals(pair[0]) && "asc".equalsIgnoreCase(pair[1])) {
                            asc = true;
                        }
                    }
                }
            }

            System.out.println("Incoming Lucene query: " + q + " | sort asc: " + asc);

            List<SearchResult> results;
            try {
                results = searcher.search(q, 10, asc);
            } catch (Exception e) {
                e.printStackTrace();
                results = List.of();
            }

            StringBuilder json = new StringBuilder("[");
            for (int i = 0; i < results.size(); i++) {
                SearchResult r = results.get(i);

                String safeFileName = (r.fileName() == null ? "" : r.fileName())
                        .replace("\\", "\\\\")
                        .replace("\"", "\\\"");

                String safeFilePath = (r.filePath() == null ? "" : r.filePath())
                        .replace("\\", "\\\\")
                        .replace("\"", "\\\"");

                String safeContent = (r.content() == null ? "" : r.content())
                        .replace("\\", "\\\\")
                        .replace("\"", "\\\"")
                        .replace("\n", " ")
                        .replace("\r", " ");

                json.append("{")
                        .append("\"fileName\":\"").append(safeFileName).append("\",")
                        .append("\"filePath\":\"").append(safeFilePath).append("\",")
                        .append("\"content\":\"").append(safeContent).append("\",")
                        .append("\"score\":").append(r.score())
                        .append("}");

                if (i < results.size() - 1) {
                    json.append(",");
                }
            }
            json.append("]");

            byte[] response = json.toString().getBytes(StandardCharsets.UTF_8);

            exchange.getResponseHeaders().add("Content-Type", "application/json; charset=UTF-8");
            exchange.sendResponseHeaders(200, response.length);

            try (OutputStream os = exchange.getResponseBody()) {
                os.write(response);
            }
        });

        server.start();
        System.out.println("Server started on http://localhost:8080/search?q=hoodie");
    }
}