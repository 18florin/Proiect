package com.carrental.lucene;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

public class Main {
    public static void main(String[] args) throws Exception {

        Path pdfFolder = Path.of("/home/ice003/ProiectIII/CarRentalProject/client/public/pdfs");
        Path indexFolder = Path.of("index-data");

        System.out.println("PDF folder: " + pdfFolder.toAbsolutePath());

        System.out.println("\nFiles found:");
        Files.list(pdfFolder).forEach(path -> {
            System.out.println(" - " + path.getFileName());
        });

        PdfIndexer indexer = new PdfIndexer(pdfFolder, indexFolder);
        indexer.buildIndex();

        System.out.println("\nLucene index created successfully.");

        PdfSearcher searcher = new PdfSearcher(indexFolder);

        String query = "car";
        boolean ascending = false;

        List<SearchResult> results = searcher.search(query, 10, ascending);

        System.out.println("\nSearch results for query: " + query);
        System.out.println("--------------------------------------------------");

        for (SearchResult result : results) {
            System.out.println("File: " + result.fileName());
            System.out.println("Score: " + result.score());
            System.out.println("Path: " + result.filePath());

            String preview = result.content();
            if (preview != null && preview.length() > 200) {
                preview = preview.substring(0, 200) + "...";
            }

            System.out.println("Preview: " + preview);
            System.out.println("--------------------------------------------------");
        }
    }
}