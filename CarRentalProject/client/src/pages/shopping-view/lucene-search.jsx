import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { merchProducts } from "@/data/merch-products";
import { useDispatch } from "react-redux";
import { addToCart } from "@/store/shop/cart-slice";

export default function LuceneSearchPage() {
  const location = useLocation();
  const dispatch = useDispatch();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [sort, setSort] = useState("desc");

  const normalize = (str) => str.toLowerCase().replace(/[^a-z0-9]/g, "");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get("q");

    if (q) {
      setQuery(q);
      handleSearch(q);
    }
  }, []);

  async function handleSearch(qParam) {
    const q = qParam || query;

    if (!q.trim()) {
      setResults([]);
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:8080/search?q=${q}&sort=${sort}`,
      );

      const data = await res.json();

      console.log("LUCENE RAW:", data);

      const mapped = data
        .map((r) => {
          const file = normalize(r.fileName);

          const product = merchProducts.find((p) => {
            const title = normalize(p.title);

            return file.includes(title) || title.includes(file);
          });

          if (!product) {
            console.log("NO MATCH FOR:", r.fileName);
            return null;
          }

          return {
            ...product,
            score: r.score,
          };
        })
        .filter(Boolean);

      console.log("MAPPED:", mapped);

      const uniqueMap = new Map();

      mapped.forEach((item) => {
        const existing = uniqueMap.get(item.id);

        if (!existing || item.score > existing.score) {
          uniqueMap.set(item.id, item);
        }
      });

      const finalResults = Array.from(uniqueMap.values());

      console.log("FINAL RESULTS:", finalResults);

      setResults(finalResults);
    } catch (err) {
      console.error("Lucene search failed", err);
    }
  }

  function handleAddToCart(product) {
    dispatch(addToCart(product));
  }

  return (
    <div className="min-h-screen bg-[#f6f6f6] p-10">
      <div className="max-w-6xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold">Advanced Search Results (Lucene)</h1>

        <div className="flex gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 border px-3 py-2 rounded-md"
            placeholder="Search in specifications..."
          />

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="border px-2 rounded-md"
          >
            <option value="desc">Highest score</option>
            <option value="asc">Lowest score</option>
          </select>

          <Button onClick={() => handleSearch()}>Search</Button>
        </div>

        {results.length === 0 ? (
          <p className="text-gray-500">No results found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-xl border shadow-sm overflow-hidden hover:shadow-md transition"
              >
                <img
                  src={p.image}
                  alt={p.title}
                  className="w-full h-52 object-cover"
                />

                <div className="p-4 space-y-2">
                  <h3 className="font-semibold">{p.title}</h3>

                  <p className="text-sm text-muted-foreground">{p.price} RON</p>

                  <p className="text-xs text-blue-600">
                    Score: {p.score.toFixed(3)}
                  </p>

                  <div className="flex gap-2 pt-2">
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
        )}

        <div className="bg-white p-6 rounded-lg border space-y-4">
          <h2 className="text-xl font-semibold">
            How Lucene calculates score (BM25)
          </h2>

          <p className="text-sm text-gray-700">
            Apache Lucene uses the <strong>BM25 ranking algorithm</strong> to
            determine how relevant a document is to a search query. The higher
            the score, the more relevant the document is considered.
          </p>

          <p className="text-sm text-gray-700">
            The BM25 score is based on several important factors:
          </p>

          <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
            <li>
              <strong>Term Frequency (TF)</strong> – how many times a search
              term appears in a document. More occurrences increase the score.
            </li>
            <li>
              <strong>Inverse Document Frequency (IDF)</strong> – measures how
              rare a term is across all documents. Rare terms contribute more to
              the score.
            </li>
            <li>
              <strong>Document length normalization</strong> – longer documents
              are penalized so that shorter, more relevant documents are ranked
              higher.
            </li>
          </ul>

          <p className="text-sm text-gray-700">
            In simple terms, documents that contain the search terms more
            frequently, and where those terms are rare in the overall
            collection, will receive a higher relevance score.
          </p>

          <p className="text-sm text-gray-700">
            BM25 is an improved version of the classic TF-IDF model, providing
            more accurate and balanced ranking of search results.
          </p>
        </div>
      </div>
    </div>
  );
}
