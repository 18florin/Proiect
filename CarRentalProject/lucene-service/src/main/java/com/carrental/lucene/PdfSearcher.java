package com.carrental.lucene;

import org.apache.lucene.analysis.en.EnglishAnalyzer;
import org.apache.lucene.document.Document;
import org.apache.lucene.index.DirectoryReader;
import org.apache.lucene.queryparser.classic.QueryParser;
import org.apache.lucene.search.*;
import org.apache.lucene.search.similarities.BM25Similarity;
import org.apache.lucene.store.Directory;
import org.apache.lucene.store.FSDirectory;

import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;

public class PdfSearcher {
    private final Path indexFolder;

    public PdfSearcher(Path indexFolder) {
        this.indexFolder = indexFolder;
    }

    public List<SearchResult> search(String queryText, int maxResults, boolean ascending) throws Exception {
        List<SearchResult> results = new ArrayList<>();

        Directory directory = FSDirectory.open(indexFolder);

        try (DirectoryReader reader = DirectoryReader.open(directory)) {
            IndexSearcher searcher = new IndexSearcher(reader);
            searcher.setSimilarity(new BM25Similarity());

            EnglishAnalyzer analyzer = new EnglishAnalyzer();

            QueryParser parser = new QueryParser("content", analyzer);

            parser.setDefaultOperator(QueryParser.Operator.AND);

            String normalizedQuery = queryText
                    .toLowerCase()
                    .replaceAll("[^a-z0-9\\s]", " ")
                    .trim();

            Query query = parser.parse(normalizedQuery);

            TopDocs topDocs = searcher.search(query, maxResults);

            for (ScoreDoc scoreDoc : topDocs.scoreDocs) {
                Document doc = searcher.doc(scoreDoc.doc);

                results.add(new SearchResult(
                        doc.get("fileName"),
                        doc.get("filePath"),
                        doc.get("content"),
                        scoreDoc.score));
            }
        }

        if (ascending) {
            results.sort((a, b) -> Float.compare(a.score(), b.score()));
        } else {
            results.sort((a, b) -> Float.compare(b.score(), a.score()));
        }

        return results;
    }
}