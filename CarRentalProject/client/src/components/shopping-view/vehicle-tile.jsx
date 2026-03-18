//src/components/shopping-view/vehicle-tile.jsx
import { useState } from "react";
import { Card, CardContent, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import { brandOptionsMap, categoryOptionsMap } from "@/config";
import { Badge } from "../ui/badge";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

export default function ShoppingVehicleTile({
  vehicle,
  handleGetVehicleDetails,
  handleReserveVehicle,
  handleSaveVehicle,
  isSaved,
}) {
  const imgs =
    Array.isArray(vehicle.images) && vehicle.images.length > 0
      ? vehicle.images
      : vehicle.image
        ? [vehicle.image]
        : [];

  const [currentIdx, setCurrentIdx] = useState(0);

  const stop = (e) => e.stopPropagation();

  return (
    <Card className="w-full max-w-sm mx-auto">
      <div onClick={() => handleGetVehicleDetails(vehicle._id)}>
        <div className="relative">
          {imgs[currentIdx] && (
            <img
              src={imgs[currentIdx]}
              alt={`${vehicle.title} ${currentIdx + 1}`}
              className="w-full h-[300px] object-cover rounded-t-lg"
            />
          )}

          {imgs.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  stop(e);
                  setCurrentIdx((i) => (i - 1 + imgs.length) % imgs.length);
                }}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1 rounded-full"
              >
                <ChevronLeftIcon className="w-5 h-5" />
              </button>
              <button
                onClick={(e) => {
                  stop(e);
                  setCurrentIdx((i) => (i + 1) % imgs.length);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1 rounded-full"
              >
                <ChevronRightIcon className="w-5 h-5" />
              </button>
            </>
          )}

          {vehicle.salePrice > 0 && (
            <Badge className="absolute top-2 left-2 bg-green-500">Sale</Badge>
          )}

          <Badge
            className={`absolute top-2 right-2 px-2 py-1 text-sm ${
              vehicle.isAvailable ? "bg-green-500" : "bg-red-500"
            }`}
          >
            {vehicle.isAvailable ? "Available" : "Rented"}
          </Badge>
        </div>

        <CardContent className="p-4">
          <h2 className="text-xl font-bold mb-1">{vehicle.title}</h2>
          <p className="text-sm text-muted-foreground mb-1">
            Year: {vehicle.year}
          </p>
          <p className="text-sm text-muted-foreground mb-2">
            Location: {vehicle.location}
          </p>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">
              {categoryOptionsMap[vehicle.category]}
            </span>
            <span className="text-sm text-muted-foreground">
              {brandOptionsMap[vehicle.brand]}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span
              className={`text-lg font-semibold text-primary ${
                vehicle.salePrice > 0 ? "line-through" : ""
              }`}
            >
              ${vehicle.price}
            </span>
            {vehicle.salePrice > 0 && (
              <span className="text-lg font-semibold text-primary">
                ${vehicle.salePrice}
              </span>
            )}
          </div>
        </CardContent>
      </div>

      <CardFooter className="flex flex-col gap-2">
        {!vehicle.isAvailable ? (
          <Button className="w-full opacity-60 cursor-not-allowed" disabled>
            Rented
          </Button>
        ) : (
          <Button
            onClick={() => handleReserveVehicle(vehicle._id)}
            className="w-full"
          >
            Reserve Vehicle
          </Button>
        )}
        <Button
          onClick={() => handleSaveVehicle(vehicle._id)}
          variant={isSaved ? "secondary" : "outline"}
          className="w-full"
        >
          {isSaved ? "Saved" : "Save Car"}
        </Button>
      </CardFooter>
    </Card>
  );
}
