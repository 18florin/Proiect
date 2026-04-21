//client/src/pages/shopping-view/merch.jsx
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useDispatch } from "react-redux";
import { addToCart } from "@/store/shop/cart-slice";
import { merchProducts } from "@/data/merch-products";
import { getAutocompleteSuggestions } from "@/utils/autocomplete";

/* ================= TF-IDF ================= */

function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, " ")
    .replace(/-/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function buildTfIdfIndex(products) {
  const N = products.length;
  const documents = {};
  const df = {};

  products.forEach((product) => {
    const tokens = tokenize(product.title);
    const tf = {};

    tokens.forEach((token) => {
      tf[token] = (tf[token] || 0) + 1;
    });

    const totalTerms = tokens.length;

    Object.keys(tf).forEach((term) => {
      tf[term] = tf[term] / totalTerms;
    });

    const uniqueTerms = [...new Set(tokens)];
    uniqueTerms.forEach((term) => {
      df[term] = (df[term] || 0) + 1;
    });

    documents[product.id] = { product, tf };
  });

  const idf = {};
  Object.keys(df).forEach((term) => {
    idf[term] = Math.log(1 + N / df[term]);
  });

  return { documents, idf };
}

function searchProducts(query, index) {
  const queryTokens = tokenize(query);
  const results = [];

  Object.values(index.documents).forEach((doc) => {
    let score = 0;

    queryTokens.forEach((term) => {
      if (doc.tf[term] && index.idf[term] !== undefined) {
        score += doc.tf[term] * index.idf[term];
      }
    });

    if (score > 0) {
      results.push({ ...doc.product, score });
    }
  });

  results.sort((a, b) => b.score - a.score);
  return results;
}

/* ================= HIGHLIGHT ================= */

function highlightSuggestion(title, query) {
  if (!query.trim()) return title;

  const lowerTitle = title.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const startIndex = lowerTitle.indexOf(lowerQuery);

  if (startIndex === -1) return title;

  const before = title.slice(0, startIndex);
  const typedPart = title.slice(startIndex, startIndex + query.length);
  const remainingPart = title.slice(startIndex + query.length);

  return (
    <>
      {before}
      <span>{typedPart}</span>
      <strong>{remainingPart}</strong>
    </>
  );
}

/* ================= COMPONENT ================= */

export default function MerchPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [searchInput, setSearchInput] = useState("");
  const [searchedProducts, setSearchedProducts] = useState(merchProducts);
  const [suggestions, setSuggestions] = useState([]);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0);

  const tfidfIndex = useMemo(() => buildTfIdfIndex(merchProducts), []);

  function handleAddToCart(product) {
    dispatch(addToCart(product));
  }

  function handleInputChange(e) {
    const value = e.target.value;
    setSearchInput(value);

    const nextSuggestions = getAutocompleteSuggestions(merchProducts, value);
    setSuggestions(nextSuggestions);
    setActiveSuggestionIndex(0);
  }

  function handleSuggestionClick(productTitle) {
    setSearchInput(productTitle);

    const results = searchProducts(productTitle, tfidfIndex);
    setSearchedProducts(results);
    setSuggestions([]);
  }

  function handleSearch() {
    const trimmedQuery = searchInput.trim();

    if (!trimmedQuery) {
      setSearchedProducts(merchProducts);
      return;
    }

    const results = searchProducts(trimmedQuery, tfidfIndex);
    setSearchedProducts(results);
    setSuggestions([]);
  }

  function handleReset() {
    setSearchInput("");
    setSearchedProducts(merchProducts);
    setSuggestions([]);
  }

  function handleKeyDown(e) {
    if (suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveSuggestionIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : prev,
      );
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveSuggestionIndex((prev) => (prev > 0 ? prev - 1 : 0));
    }

    if (e.key === "Enter") {
      e.preventDefault();
      const selected = suggestions[activeSuggestionIndex];
      if (selected) {
        handleSuggestionClick(selected.title);
      } else {
        handleSearch();
      }
    }

    if (e.key === "Escape") {
      setSuggestions([]);
    }
  }

  const groupedProducts = searchedProducts.reduce((acc, product) => {
    if (!acc[product.category]) acc[product.category] = [];
    acc[product.category].push(product);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-[#f6f6f6]">
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-10">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
            RentCar Merchandise
          </h1>

          <div className="mt-6 max-w-2xl space-y-3">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <input
                  value={searchInput}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Search products..."
                  className="w-full h-10 rounded-md border border-slate-300 px-3 text-sm focus:ring-2 focus:ring-slate-400 outline-none"
                />

                {suggestions.length > 0 && (
                  <div className="absolute w-full bg-white border rounded-md shadow-md mt-1 z-50">
                    {suggestions.map((p, i) => (
                      <button
                        key={p.id}
                        onClick={() => handleSuggestionClick(p.title)}
                        className={`block w-full text-left px-3 py-2 text-sm ${
                          i === activeSuggestionIndex
                            ? "bg-slate-100"
                            : "hover:bg-slate-50"
                        }`}
                      >
                        {highlightSuggestion(p.title, searchInput)}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <Button onClick={handleSearch}>Search</Button>

              {/* 🔥 BUTON NOU */}
              <Button
                variant="outline"
                onClick={() => navigate(`/shop/lucene-search?q=${searchInput}`)}
              >
                Advanced Search (Lucene)
              </Button>

              <Button variant="outline" onClick={handleReset}>
                Reset
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* PRODUCTS */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-10 space-y-12">
        {Object.entries(groupedProducts).map(([category, products]) => (
          <section key={category}>
            <h2 className="text-2xl font-semibold mb-6">{category}</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((p) => (
                <div
                  key={p.id}
                  className="bg-white rounded-xl border shadow-sm overflow-hidden hover:shadow-md transition"
                >
                  <img src={p.image} className="w-full h-52 object-cover" />

                  <div className="p-4 space-y-2">
                    <h3 className="font-semibold">{p.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {p.price} RON
                    </p>

                    <div className="flex gap-2">
                      <Button
                        className="flex-1"
                        onClick={() => handleAddToCart(p)}
                      >
                        Add to Cart
                      </Button>

                      <Link to={`/shop/merch/${p.id}`} className="flex-1">
                        <Button variant="outline" className="w-full">
                          View
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
