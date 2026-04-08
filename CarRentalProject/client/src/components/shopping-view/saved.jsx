//client/src/components/shopping-view/saved.jsx
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import ShoppingVehicleTile from "./vehicle-tile";
import { fetchAllFilteredVehicles } from "@/store/shop/vehicles-slice";
import { useToast } from "@/components/ui/use-toast";

export default function SavedCars() {
  const dispatch = useDispatch();
  const { vehicleList } = useSelector((s) => s.shopVehicles);
  const [savedIds, setSavedIds] = useState(() =>
    JSON.parse(localStorage.getItem("savedCars") || "[]"),
  );
  const { toast } = useToast();

  useEffect(() => {
    if (!vehicleList.length) {
      dispatch(
        fetchAllFilteredVehicles({
          filterParams: {},
          sortParams: "price-lowtohigh",
        }),
      );
    }
  }, [dispatch, vehicleList.length]);

  const savedVehicles = vehicleList.filter((v) => savedIds.includes(v._id));

  if (!savedVehicles.length) {
    return <p className="p-4 text-center">You haven't saved any cars yet.</p>;
  }

  function handleRemove(id) {
    const next = savedIds.filter((vid) => vid !== id);
    setSavedIds(next);
    localStorage.setItem("savedCars", JSON.stringify(next));
    toast({ title: "Removed from saved cars" });
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
      {savedVehicles.map((v) => (
        <ShoppingVehicleTile
          key={v._id}
          vehicle={v}
          handleGetVehicleDetails={() => {}}
          handleReserveVehicle={() => {}}
          handleSaveVehicle={handleRemove}
          isSaved={true}
        />
      ))}
    </div>
  );
}
