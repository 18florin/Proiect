import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useDispatch } from "react-redux";
import { addToCart } from "@/store/shop/cart-slice";
import { merchProducts } from "@/data/merch-products";

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

export default function MerchPage() {
  const dispatch = useDispatch();
  const [searchInput, setSearchInput] = useState("");
  const [searchedProducts, setSearchedProducts] = useState(merchProducts);

  const tfidfIndex = useMemo(() => buildTfIdfIndex(merchProducts), []);

  function handleAddToCart(product) {
    dispatch(addToCart(product));
  }

  function handleSearch() {
    const trimmedQuery = searchInput.trim();

    if (!trimmedQuery) {
      setSearchedProducts(merchProducts);
      return;
    }

    const results = searchProducts(trimmedQuery, tfidfIndex);
    setSearchedProducts(results);
  }

  function handleReset() {
    setSearchInput("");
    setSearchedProducts(merchProducts);
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

          <div className="mt-6 flex flex-col sm:flex-row gap-3 max-w-2xl">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search products by title..."
              className="flex-1 h-10 rounded-md border border-slate-300 px-3 text-sm outline-none focus:ring-2 focus:ring-slate-400"
            />
            <Button onClick={handleSearch}>Search</Button>
            <Button variant="outline" onClick={handleReset}>
              Reset
            </Button>
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

                        <a
                          href={product.pdfUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex-1"
                        >
                          <Button variant="outline" className="w-full">
                            View Details
                          </Button>
                        </a>
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
