// src/pages/shopping-view/SearchVehicles.jsx
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";

import VehicleDetailsDialog from "@/components/shopping-view/vehicle-details";
import ShoppingVehicleTile from "@/components/shopping-view/vehicle-tile";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

import { fetchVehicleDetails } from "@/store/shop/vehicles-slice";
import {
  createNewReservation,
  getAllReservationsByUserId,
} from "@/store/shop/reservation-slice";
import {
  getSearchResults,
  resetSearchResults,
} from "@/store/shop/search-slice";

export default function SearchVehicles() {
  const dispatch = useDispatch();
  const { toast } = useToast();

  // read + write the `keyword` query param
  const [searchParams, setSearchParams] = useSearchParams();
  const initialKeyword = searchParams.get("keyword") || "";

  const [keyword, setKeyword] = useState(initialKeyword);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);

  const { searchResults } = useSelector((state) => state.shopSearch);
  const { vehicleDetails } = useSelector((state) => state.shopVehicles);
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  // sync URL → state on mount (so if someone links to ?keyword=foo we immediately search)
  useEffect(() => {
    if (initialKeyword.trim().length > 3) {
      dispatch(getSearchResults(initialKeyword));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounce typing → dispatch search
  useEffect(() => {
    setSearchParams((prev) => {
      // always update the URL param
      return keyword.trim().length > 0 ? { keyword } : {};
    });

    if (keyword.trim().length > 3) {
      const handler = setTimeout(() => {
        dispatch(getSearchResults(keyword));
      }, 500);
      return () => clearTimeout(handler);
    } else {
      dispatch(resetSearchResults());
    }
  }, [keyword, dispatch, setSearchParams]);

  // whenever you select a vehicle to view, open the dialog
  useEffect(() => {
    if (vehicleDetails) {
      setOpenDetailsDialog(true);
    }
  }, [vehicleDetails]);

  function handleGetVehicleDetails(id) {
    dispatch(fetchVehicleDetails(id));
  }

  async function handleReserveVehicle(v) {
    if (!isAuthenticated) {
      return toast({ title: "Please log in first", variant: "destructive" });
    }

    // replicate your listing logic for address + date prompts...
    // for brevity assume addressList is already loaded elsewhere
    const addressInfo = {}; // ← grab from your shopAddress slice
    if (
      !addressInfo ||
      !addressInfo.address ||
      !addressInfo.city ||
      !addressInfo.pincode ||
      !addressInfo.phone
    ) {
      return toast({
        title: "Please set your pickup address in Account → Address",
        variant: "destructive",
      });
    }

    const startInput = window.prompt("Start date (YYYY-MM-DD):");
    const endInput = window.prompt("End date (YYYY-MM-DD):");
    const startDate = new Date(startInput);
    const endDate = new Date(endInput);
    if (
      !startInput ||
      !endInput ||
      isNaN(startDate.getTime()) ||
      isNaN(endDate.getTime())
    ) {
      return toast({
        title: "Invalid dates; reservation cancelled",
        variant: "destructive",
      });
    }

    const perDayPrice = v.salePrice > 0 ? v.salePrice : v.price;
    const days = Math.max(
      1,
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const totalAmount = perDayPrice * days;

    const payload = {
      userId: user._id,
      vehicles: [{ vehicleId: v._id, quantity: 1, price: perDayPrice }],
      totalAmount,
      startDate,
      endDate,
      addressInfo,
    };

    try {
      await dispatch(createNewReservation(payload)).unwrap();
      toast({ title: "Reservation request sent!" });
      dispatch(getAllReservationsByUserId(user._id));
    } catch (err) {
      toast({
        title: err.message || "Failed to make reservation",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-center mb-8">
        <Input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Search Vehicles…"
          className="w-full max-w-xl py-3"
        />
      </div>

      {searchResults.length === 0 ? (
        <h2 className="text-center text-2xl font-bold text-muted-foreground">
          No results found!
        </h2>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {searchResults.map((v) => (
            <ShoppingVehicleTile
              key={v._id}
              vehicle={v}
              handleGetVehicleDetails={() => handleGetVehicleDetails(v._id)}
              handleReserveVehicle={() => handleReserveVehicle(v)}
            />
          ))}
        </div>
      )}

      <VehicleDetailsDialog
        open={openDetailsDialog}
        setOpen={setOpenDetailsDialog}
        vehicleDetails={vehicleDetails}
        onReserve={handleReserveVehicle}
      />
    </div>
  );
}
