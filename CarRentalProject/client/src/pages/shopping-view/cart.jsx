import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import {
  clearCart,
  decreaseQuantity,
  increaseQuantity,
  removeFromCart,
} from "@/store/shop/cart-slice";

export default function CartPage() {
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.merchCart.items);

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  function handleCheckout() {
    alert("Order placed successfully!");
    dispatch(clearCart());
  }

  return (
    <div className="min-h-screen bg-[#f6f6f6]">
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-10">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">
          Shopping Cart
        </h1>

        {cartItems.length === 0 ? (
          <div className="bg-white border rounded-xl p-8 text-center shadow-sm">
            <p className="text-muted-foreground">Your cart is empty.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            <div className="bg-white border rounded-xl shadow-sm">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold">Products</h2>
              </div>

              <div className="divide-y">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                  >
                    <div>
                      <h3 className="text-lg font-semibold">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {item.description}
                      </p>
                      <p className="mt-2 font-medium">
                        {item.price} RON / item
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        onClick={() => dispatch(decreaseQuantity(item.id))}
                      >
                        -
                      </Button>

                      <span className="min-w-[24px] text-center">
                        {item.quantity}
                      </span>

                      <Button
                        variant="outline"
                        onClick={() => dispatch(increaseQuantity(item.id))}
                      >
                        +
                      </Button>
                    </div>

                    <div className="flex flex-col items-start md:items-end gap-2">
                      <p className="font-semibold">
                        {item.price * item.quantity} RON
                      </p>
                      <Button
                        variant="destructive"
                        onClick={() => dispatch(removeFromCart(item.id))}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border rounded-xl shadow-sm p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">Total</h2>
                <p className="text-muted-foreground">
                  Total amount to be paid for all selected products.
                </p>
              </div>

              <div className="flex flex-col md:items-end gap-3">
                <p className="text-2xl font-bold">{totalPrice} RON</p>
                <Button onClick={handleCheckout}>Checkout</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
