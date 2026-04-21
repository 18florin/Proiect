package com.carrental.lucene;

public record SearchResult(
    String fileName,
    String filePath,
    String content,
    float score
) {}