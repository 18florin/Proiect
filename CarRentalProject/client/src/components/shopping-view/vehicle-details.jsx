//client/src/components/shopping-view/vehicle-details.jsx
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Dialog, DialogContent, DialogTitle, DialogClose } from "../ui/dialog";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Separator } from "../ui/separator";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import StarRatingComponent from "../common/star-rating";
import { setVehicleDetails } from "@/store/shop/vehicles-slice";
import { getReviews, addReview, clearReviews } from "@/store/shop/review-slice";

export default function VehicleDetailsDialog({
  open,
  setOpen,
  vehicleDetails,
  onReserve,
}) {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { reviews, isLoading, error } = useSelector((s) => s.shopReview);

  const [rating, setRating] = useState(0);
  const [reviewMsg, setReviewMsg] = useState("");
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    if (open && vehicleDetails?._id) {
      setCurrentIdx(0);
      setRating(0);
      setReviewMsg("");
      dispatch(getReviews(vehicleDetails._id));
    }
  }, [open, vehicleDetails, dispatch]);

  function closeDialog() {
    setOpen(false);
    dispatch(setVehicleDetails());
    dispatch(clearReviews());
  }

  if (!vehicleDetails) return null;

  const images =
    Array.isArray(vehicleDetails.images) && vehicleDetails.images.length
      ? vehicleDetails.images
      : vehicleDetails.image
        ? [vehicleDetails.image]
        : [];

  const averageReview = reviews.length
    ? reviews.reduce((sum, r) => sum + r.reviewValue, 0) / reviews.length
    : 0;

  async function submitReview() {
    if (!user) return;
    await dispatch(
      addReview({
        productId: vehicleDetails._id,
        userId: user._id,
        userName: user.userName,
        reviewMessage: reviewMsg,
        reviewValue: rating,
      }),
    ).unwrap();
    setReviewMsg("");
    setRating(0);
  }

  return (
    <Dialog open={open} onOpenChange={closeDialog}>
      <DialogContent className="max-w-[90vw] lg:max-w-[70vw] p-6 grid gap-4">
        <DialogTitle className="sr-only">{vehicleDetails.title}</DialogTitle>

        <div className="grid grid-cols-2 gap-8">
          <div className="relative overflow-hidden rounded-lg">
            {images.length > 1 && (
              <button
                onClick={() =>
                  setCurrentIdx((i) => (i + images.length - 1) % images.length)
                }
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full"
              >
                ‹
              </button>
            )}
            {images[currentIdx] && (
              <img
                src={images[currentIdx]}
                alt={`${vehicleDetails.title} ${currentIdx + 1}`}
                className="w-full aspect-square object-cover"
              />
            )}
            {images.length > 1 && (
              <button
                onClick={() => setCurrentIdx((i) => (i + 1) % images.length)}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full"
              >
                ›
              </button>
            )}
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold">{vehicleDetails.title}</h2>
            <p className="text-muted-foreground">
              {vehicleDetails.description}
            </p>

            <div className="flex items-baseline gap-4">
              {vehicleDetails.salePrice > 0 && (
                <span className="text-xl line-through">
                  ${vehicleDetails.price}
                </span>
              )}
              <span className="text-3xl font-bold text-primary">
                $
                {vehicleDetails.salePrice > 0
                  ? vehicleDetails.salePrice
                  : vehicleDetails.price}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <StarRatingComponent rating={averageReview} />
              <span className="text-muted-foreground">
                ({averageReview.toFixed(2)})
              </span>
            </div>

            <Button
              className="w-full"
              disabled={!vehicleDetails.isAvailable}
              onClick={() => onReserve(vehicleDetails)}
            >
              {vehicleDetails.isAvailable ? "Reserve Vehicle" : "Not Available"}
            </Button>

            <Separator />

            {isLoading ? (
              <p>Loading reviews…</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : (
              <div className="space-y-4 max-h-[300px] overflow-auto">
                {reviews.length ? (
                  reviews.map((rev) => (
                    <div key={rev._id} className="flex gap-4">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback>
                          {rev.userName[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{rev.userName}</span>
                          <StarRatingComponent rating={rev.reviewValue} />
                        </div>
                        <p className="text-muted-foreground">
                          {rev.reviewMessage}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">No reviews yet.</p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label>Your review</Label>
              <StarRatingComponent
                rating={rating}
                handleRatingChange={setRating}
              />
              <Input
                value={reviewMsg}
                onChange={(e) => setReviewMsg(e.target.value)}
                placeholder="Write a review…"
              />
              <Button
                onClick={submitReview}
                disabled={!reviewMsg.trim() || rating === 0}
              >
                Submit Review
              </Button>
            </div>
          </div>
        </div>

        <DialogClose className="absolute top-4 right-4 opacity-70 hover:opacity-100">
          <span className="sr-only">Close</span>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
