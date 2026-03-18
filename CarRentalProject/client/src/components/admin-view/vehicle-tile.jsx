//src/components/admin-view/vehicle-tile.jsx
import { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardFooter } from "../ui/card";
import { Badge } from "../ui/badge";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

function AdminVehicleTile({
  vehicle,
  setFormData,
  setOpenCreateVehiclesDialog,
  setCurrentEditedId,
  handleDelete,
}) {
  const imgs =
    Array.isArray(vehicle.images) && vehicle.images.length > 0
      ? vehicle.images
      : vehicle.image
        ? [vehicle.image]
        : [];

  const [current, setCurrent] = useState(0);

  const prev = (e) => {
    e.stopPropagation();
    setCurrent((i) => (i - 1 + imgs.length) % imgs.length);
  };
  const next = (e) => {
    e.stopPropagation();
    setCurrent((i) => (i + 1) % imgs.length);
  };

  return (
    <Card className="w-full max-w-sm mx-auto">
      <div className="relative">
        {imgs[current] && (
          <img
            src={imgs[current]}
            alt={`${vehicle.title} ${current + 1}`}
            className="w-full h-[300px] object-cover rounded-t-lg"
          />
        )}
        {imgs.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1 rounded-full"
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </button>
            <button
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1 rounded-full"
            >
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </>
        )}
        <Badge
          className={`absolute top-2 right-2 px-2 py-1 text-sm ${
            vehicle.isAvailable ? "bg-green-500" : "bg-red-600"
          }`}
        >
          {vehicle.isAvailable ? "Available" : "Rented"}
        </Badge>
      </div>

      <CardContent>
        <h2 className="text-xl font-bold mb-1 mt-2">{vehicle.title}</h2>
        <p className="text-sm text-muted-foreground mb-3">
          Year: {vehicle.year}
        </p>
        <div className="flex justify-between items-center mb-2">
          <span
            className={`${
              vehicle.salePrice > 0 ? "line-through" : ""
            } text-lg font-semibold text-primary`}
          >
            ${vehicle.price}
          </span>
          {vehicle.salePrice > 0 && (
            <span className="text-lg font-bold">${vehicle.salePrice}</span>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex justify-between items-center">
        <Button
          onClick={() => {
            setOpenCreateVehiclesDialog(true);
            setCurrentEditedId(vehicle._id);
            setFormData({
              identifier: vehicle.identifier,
              title: vehicle.title,
              description: vehicle.description,
              category: vehicle.category,
              brand: vehicle.brand,
              price: vehicle.price.toString(),
              salePrice: vehicle.salePrice.toString(),
              isAvailable: vehicle.isAvailable.toString(),
              year: vehicle.year.toString(),
            });
          }}
        >
          Edit
        </Button>
        <Button variant="destructive" onClick={() => handleDelete(vehicle._id)}>
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
}

export default AdminVehicleTile;
