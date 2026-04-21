function normalizeText(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, " ")
    .replace(/-/g, " ")
    .trim();
}

function tokenize(text) {
  return normalizeText(text).split(/\s+/).filter(Boolean);
}

function levenshtein(a, b) {
  const matrix = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1,
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

export function getAutocompleteSuggestions(products, query, limit = 5) {
  const normalizedQuery = normalizeText(query);

  if (!normalizedQuery) return [];

  const bestMatches = new Map();

  products.forEach((product) => {
    const tokens = tokenize(product.title);

    tokens.forEach((token) => {
      const distance = levenshtein(normalizedQuery, token);
      const isMatch = distance <= 2 || token.startsWith(normalizedQuery);

      if (isMatch) {
        const existing = bestMatches.get(product.id);

        if (!existing || distance < existing.score) {
          bestMatches.set(product.id, {
            ...product,
            score: distance,
          });
        }
      }
    });
  });

  return Array.from(bestMatches.values())
    .sort((a, b) => a.score - b.score)
    .slice(0, limit);
}
