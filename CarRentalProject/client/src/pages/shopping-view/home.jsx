import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import ShoppingVehicleTile from "@/components/shopping-view/vehicle-tile";
import VehicleDetailsDialog from "@/components/shopping-view/vehicle-details";
import { useToast } from "@/components/ui/use-toast";
import { fetchAllAddresses } from "@/store/shop/address-slice";

import {
  fetchAllFilteredVehicles,
  fetchVehicleDetails,
} from "@/store/shop/vehicles-slice";
import {
  createNewReservation,
  getAllReservationsByUserId,
} from "@/store/shop/reservation-slice";
import { getFeatureImages } from "@/store/common-slice";

export default function ShoppingHome() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { vehicleList, vehicleDetails } = useSelector((s) => s.shopVehicles);
  const { featureImageList } = useSelector((s) => s.commonFeature);
  const { user, isAuthenticated } = useSelector((s) => s.auth);
  const { addressList } = useSelector((s) => s.shopAddress);

  const [currentSlide, setCurrentSlide] = useState(0);

  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);

  const [savedCars, setSavedCars] = useState(() =>
    JSON.parse(localStorage.getItem("savedCars") || "[]")
  );

  useEffect(() => {
    if (isAuthenticated && user?._id) {
      dispatch(fetchAllAddresses(user._id));
    }
  }, [dispatch, isAuthenticated, user?._id]);
  useEffect(() => {
    const timer = setInterval(() => {
      if (featureImageList.length) {
        setCurrentSlide((p) => (p + 1) % featureImageList.length);
      }
    }, 15000);
    return () => clearInterval(timer);
  }, [featureImageList]);

  useEffect(() => {
    dispatch(
      fetchAllFilteredVehicles({
        filterParams: {},
        sortParams: "price-lowtohigh",
      })
    );
    dispatch(getFeatureImages());
  }, [dispatch]);

  useEffect(() => {
    if (vehicleDetails) setOpenDetailsDialog(true);
  }, [vehicleDetails]);

  useEffect(() => {
    localStorage.setItem("savedCars", JSON.stringify(savedCars));
  }, [savedCars]);

  async function handleReserveVehicle(v) {
    if (!isAuthenticated) {
      return toast({
        title: "Please log in first",
        variant: "destructive",
      });
    }

    const addressInfo = addressList[0];
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

  function handleSaveVehicle(id) {
    setSavedCars((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
    toast({
      title: savedCars.includes(id) ? "Removed from saved cars" : "Car saved",
    });
  }

  function handleGetVehicleDetails(id) {
    dispatch(fetchVehicleDetails(id));
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="relative w-full h-[600px] overflow-hidden">
        {featureImageList.map((slide, i) => (
          <img
            key={i}
            src={slide.image}
            className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-1000 ${
              i === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
        <Button
          variant="outline"
          size="icon"
          onClick={() =>
            setCurrentSlide((p) =>
              featureImageList.length
                ? (p - 1 + featureImageList.length) % featureImageList.length
                : 0
            )
          }
          className="absolute top-1/2 left-4 bg-white/80"
        >
          <ChevronLeftIcon className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() =>
            setCurrentSlide((p) =>
              featureImageList.length ? (p + 1) % featureImageList.length : 0
            )
          }
          className="absolute top-1/2 right-4 bg-white/80"
        >
          <ChevronRightIcon className="w-4 h-4" />
        </Button>
      </div>

      <section className="py-12">
        <h2 className="text-3xl font-bold text-center mb-8">
          Featured Vehicles
        </h2>
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 container mx-auto">
          {vehicleList.map((v) => (
            <ShoppingVehicleTile
              key={v._id}
              vehicle={v}
              handleGetVehicleDetails={() => handleGetVehicleDetails(v._id)}
              handleReserveVehicle={() => handleReserveVehicle(v)}
              handleSaveVehicle={() => handleSaveVehicle(v._id)}
              isSaved={savedCars.includes(v._id)}
            />
          ))}
        </div>
      </section>

      <VehicleDetailsDialog
        open={openDetailsDialog}
        setOpen={setOpenDetailsDialog}
        vehicleDetails={vehicleDetails}
        onReserve={handleReserveVehicle}
      />
    </div>
  );
}
