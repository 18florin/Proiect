//client/src/pages/shopping-view/merch.jsx
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDispatch } from "react-redux";
import { addToCart } from "@/store/shop/cart-slice";
import { merchProducts } from "@/data/merch-products";
import { getAutocompleteSuggestions } from "@/utils/autocomplete";

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

    documents[product.id] = {
      product,
      tf,
    };
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
      results.push({
        ...doc.product,
        score,
      });
    }
  });

  results.sort((a, b) => b.score - a.score);
  return results;
}

function highlightSuggestion(title, query) {
  if (!query.trim()) {
    return title;
  }

  const lowerTitle = title.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const startIndex = lowerTitle.indexOf(lowerQuery);

  if (startIndex === -1) {
    return title;
  }

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

export default function MerchPage() {
  const dispatch = useDispatch();
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
    setActiveSuggestionIndex(0);
  }

  function handleSearch() {
    const trimmedQuery = searchInput.trim();

    if (!trimmedQuery) {
      setSearchedProducts(merchProducts);
      setSuggestions([]);
      setActiveSuggestionIndex(0);
      return;
    }

    const results = searchProducts(trimmedQuery, tfidfIndex);
    setSearchedProducts(results);
    setSuggestions([]);
    setActiveSuggestionIndex(0);
  }

  function handleReset() {
    setSearchInput("");
    setSearchedProducts(merchProducts);
    setSuggestions([]);
    setActiveSuggestionIndex(0);
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
      setActiveSuggestionIndex(0);
    }
  }

  const groupedProducts = searchedProducts.reduce((acc, product) => {
    if (!acc[product.category]) {
      acc[product.category] = [];
    }
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
          <p className="mt-3 text-muted-foreground max-w-2xl">
            Discover our branded products, grouped by categories. Each item
            includes a short description and a PDF with additional product
            details.
          </p>

          <div className="mt-6 max-w-2xl">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={searchInput}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Search products by title..."
                  autoComplete="off"
                  className="w-full h-9 border border-[#cfcfcf] bg-white px-3 text-[14px] text-black outline-none"
                />

                {suggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-full bg-white border border-[#d8d8d8] border-t-0 shadow-sm z-50">
                    {suggestions.map((product, index) => {
                      const isActive = index === activeSuggestionIndex;

                      return (
                        <button
                          key={product.id}
                          type="button"
                          onMouseEnter={() => setActiveSuggestionIndex(index)}
                          onClick={() => handleSuggestionClick(product.title)}
                          className={`w-full flex items-center gap-2 px-3 py-1.5 text-left text-[14px] ${
                            isActive
                              ? "bg-[#1a73e8] text-white"
                              : "bg-white text-black hover:bg-[#f5f5f5]"
                          }`}
                        >
                          <Search className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">
                            {highlightSuggestion(product.title, searchInput)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <Button onClick={handleSearch}>Search</Button>
              <Button variant="outline" onClick={handleReset}>
                Reset
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-10 space-y-12">
        {Object.keys(groupedProducts).length === 0 ? (
          <div className="bg-white border rounded-xl p-8 text-center shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">
              No products found
            </h2>
            <p className="text-muted-foreground mt-2">
              Try searching for terms like "t-shirt", "hoodie", "cap" or "mug".
            </p>
          </div>
        ) : (
          Object.entries(groupedProducts).map(([category, products]) => (
            <section key={category}>
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-slate-900">
                  {category}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Products available in the {category.toLowerCase()} category.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white rounded-xl border shadow-sm overflow-hidden"
                  >
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-full h-56 object-cover"
                    />

                    <div className="p-5 space-y-3">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">
                          {product.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-2">
                          {product.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-slate-900">
                          {product.price} RON
                        </span>
                        <span className="text-xs bg-slate-100 px-2 py-1 rounded-full text-slate-700">
                          {product.category}
                        </span>
                      </div>

                      <div className="flex gap-3 pt-2">
                        <Button
                          className="flex-1"
                          onClick={() => handleAddToCart(product)}
                        >
                          Add to Cart
                        </Button>

                        <Link
                          to={`/shop/merch/${product.id}`}
                          className="flex-1"
                        >
                          <Button variant="outline" className="w-full">
                            View Product
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </div>
  );
}
