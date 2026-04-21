package com.carrental.lucene;

import org.apache.lucene.analysis.en.EnglishAnalyzer;
import org.apache.lucene.document.*;
import org.apache.lucene.index.IndexWriter;
import org.apache.lucene.index.IndexWriterConfig;
import org.apache.lucene.search.similarities.BM25Similarity;
import org.apache.lucene.store.Directory;
import org.apache.lucene.store.FSDirectory;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;

import java.io.IOException;
import java.nio.file.*;
import java.util.stream.Stream;

public class PdfIndexer {
    private final Path pdfFolder;
    private final Path indexFolder;

    public PdfIndexer(Path pdfFolder, Path indexFolder) {
        this.pdfFolder = pdfFolder;
        this.indexFolder = indexFolder;
    }

    public void buildIndex() throws IOException {
        Files.createDirectories(indexFolder);

        Directory directory = FSDirectory.open(indexFolder);
        EnglishAnalyzer analyzer = new EnglishAnalyzer();
        IndexWriterConfig config = new IndexWriterConfig(analyzer);
        config.setSimilarity(new BM25Similarity());

        try (IndexWriter writer = new IndexWriter(directory, config)) {
            writer.deleteAll();

            try (Stream<Path> files = Files.list(pdfFolder)) {
                files.filter(path -> path.toString().toLowerCase().endsWith(".pdf"))
                        .forEach(path -> {
                            try {
                                indexPdf(writer, path);
                            } catch (IOException e) {
                                throw new RuntimeException("Failed to index " + path, e);
                            }
                        });
            }

            writer.commit();
        }
    }

    private void indexPdf(IndexWriter writer, Path pdfPath) throws IOException {
        String extractedText = extractTextFromPdf(pdfPath);

        System.out.println("Indexing: " + pdfPath.getFileName());

        if (extractedText != null && !extractedText.trim().isEmpty()) {
            String preview = extractedText.substring(0, Math.min(150, extractedText.length()));
            System.out.println("Extracted text preview: " + preview);
        } else {
            System.out.println("NO TEXT EXTRACTED!");
        }

        System.out.println("--------------------------------------------------");

        Document doc = new Document();
        doc.add(new StringField("fileName", pdfPath.getFileName().toString(), Field.Store.YES));
        doc.add(new StoredField("filePath", pdfPath.toAbsolutePath().toString()));

        doc.add(new TextField("content", extractedText == null ? "" : extractedText, Field.Store.YES));

        writer.addDocument(doc);
    }

    private String extractTextFromPdf(Path pdfPath) throws IOException {
        try (PDDocument pdf = PDDocument.load(pdfPath.toFile())) {
            PDFTextStripper stripper = new PDFTextStripper();
            return stripper.getText(pdf);
        }
    }
}