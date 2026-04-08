// client/src/pages/shopping-view/merch-details.jsx
import { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Button } from "@/components/ui/button";
import { addToCart } from "@/store/shop/cart-slice";
import { merchProducts } from "@/data/merch-products";
import { getSimilarProducts } from "@/utils/recommendations";

export default function MerchDetailsPage() {
  const { id } = useParams();
  const dispatch = useDispatch();

  const product = merchProducts.find((item) => item.id === Number(id));

  const similarProducts = useMemo(() => {
    return getSimilarProducts(merchProducts, id, 3);
  }, [id]);

  if (!product) {
    return (
      <div className="min-h-screen bg-[#f6f6f6] flex items-center justify-center">
        <div className="bg-white border rounded-xl p-8 shadow-sm text-center">
          <h1 className="text-2xl font-bold text-slate-900">
            Product not found
          </h1>
          <p className="text-muted-foreground mt-2">
            The requested merch product does not exist.
          </p>
          <Link to="/shop/merch">
            <Button className="mt-4">Back to Merch</Button>
          </Link>
        </div>
      </div>
    );
  }

  function handleAddToCart() {
    dispatch(addToCart(product));
  }

  return (
    <div className="min-h-screen bg-[#f6f6f6]">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-10">
        <Link
          to="/shop/merch"
          className="inline-block mb-6 text-sm text-slate-600 hover:underline"
        >
          ← Back to Merch
        </Link>

        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-2">
          <div className="bg-slate-50 flex items-center justify-center p-6">
            <img
              src={product.image}
              alt={product.title}
              className="w-full max-w-md h-auto object-contain rounded-xl"
            />
          </div>

          <div className="p-8 space-y-5">
            <span className="inline-block text-xs bg-slate-100 px-3 py-1 rounded-full text-slate-700">
              {product.category}
            </span>

            <h1 className="text-3xl font-bold text-slate-900">
              {product.title}
            </h1>

            <p className="text-muted-foreground leading-7">
              {product.description}
            </p>

            <p className="text-2xl font-bold text-slate-900">
              {product.price} RON
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button onClick={handleAddToCart} className="sm:w-auto">
                Add to Cart
              </Button>

              <a href={product.pdfUrl} target="_blank" rel="noreferrer">
                <Button variant="outline">View Details PDF</Button>
              </a>
            </div>
          </div>
        </div>

        {similarProducts.length > 0 && (
          <div className="mt-10">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">
              Similar Products
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {similarProducts.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl border shadow-sm overflow-hidden"
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-56 object-cover"
                  />

                  <div className="p-5 space-y-3">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">
                        {item.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-2">
                        {item.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-slate-900">
                        {item.price} RON
                      </span>
                      <span className="text-xs bg-slate-100 px-2 py-1 rounded-full text-slate-700">
                        {item.category}
                      </span>
                    </div>

                    <Link to={`/shop/merch/${item.id}`}>
                      <Button variant="outline" className="w-full">
                        View Product
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
