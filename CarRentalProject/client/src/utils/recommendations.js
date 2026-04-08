//client/src/utils/recommendations.js
function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, " ")
    .replace(/-/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function buildDocuments(products) {
  return products.map((product) => ({
    ...product,
    combinedText: `${product.title} ${product.description}`,
  }));
}

function buildTfIdfVectors(products) {
  const docs = buildDocuments(products);
  const tokenizedDocs = docs.map((doc) => tokenize(doc.combinedText));
  const vocabulary = new Set();

  tokenizedDocs.forEach((tokens) => {
    tokens.forEach((token) => vocabulary.add(token));
  });

  const vocabArray = Array.from(vocabulary);
  const N = docs.length;

  const df = {};
  vocabArray.forEach((term) => {
    df[term] = tokenizedDocs.filter((tokens) => tokens.includes(term)).length;
  });

  const idf = {};
  vocabArray.forEach((term) => {
    idf[term] = Math.log(1 + N / df[term]);
  });

  const vectors = docs.map((doc, index) => {
    const tokens = tokenizedDocs[index];
    const tf = {};

    tokens.forEach((token) => {
      tf[token] = (tf[token] || 0) + 1;
    });

    const totalTerms = tokens.length;

    vocabArray.forEach((term) => {
      tf[term] = (tf[term] || 0) / totalTerms;
    });

    const vector = vocabArray.map((term) => tf[term] * idf[term]);

    return {
      product: doc,
      vector,
    };
  });

  return vectors;
}

function cosineSimilarity(vecA, vecB) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) return 0;

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export function getSimilarProducts(products, currentProductId, limit = 3) {
  const vectors = buildTfIdfVectors(products);
  const currentItem = vectors.find(
    (item) => item.product.id === Number(currentProductId),
  );

  if (!currentItem) return [];

  return vectors
    .filter((item) => item.product.id !== Number(currentProductId))
    .map((item) => ({
      ...item.product,
      similarity: cosineSimilarity(currentItem.vector, item.vector),
    }))
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit);
}
