import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import ShoppingVehicleTile from "@/components/shopping-view/vehicle-tile";
import VehicleDetailsDialog from "@/components/shopping-view/vehicle-details";
import { useToast } from "@/components/ui/use-toast";
import { fetchAllAddresses } from "@/store/shop/address-slice";
import MobileGpsPanel from "@/components/common/mobile-gps-panel";

import {
  fetchAllFilteredVehicles,
  fetchVehicleDetails,
} from "@/store/shop/vehicles-slice";
import {
  createNewReservation,
  getAllReservationsByUserId,
} from "@/store/shop/reservation-slice";
import { getFeatureImages } from "@/store/common-slice";
import {
  markReservationSubmittedToAdmins,
  resetMobileApproval,
  setPendingMobileApproval,
} from "@/store/mobile-slice";

export default function ShoppingHome() {
  const dispatch = useDispatch();
  const { toast } = useToast();

  const { vehicleList, vehicleDetails } = useSelector((s) => s.shopVehicles);
  const { featureImageList } = useSelector((s) => s.commonFeature);
  const { user, isAuthenticated } = useSelector((s) => s.auth);
  const { addressList } = useSelector((s) => s.shopAddress);
  const { connected, approvalStatus, pendingReservation } = useSelector(
    (s) => s.mobile,
  );

  const [currentSlide, setCurrentSlide] = useState(0);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [savedCars, setSavedCars] = useState(
    JSON.parse(localStorage.getItem("savedCars") || "[]"),
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
      }),
    );
    dispatch(getFeatureImages());
  }, [dispatch]);

  useEffect(() => {
    if (vehicleDetails) {
      setOpenDetailsDialog(true);
    }
  }, [vehicleDetails]);

  useEffect(() => {
    localStorage.setItem("savedCars", JSON.stringify(savedCars));
  }, [savedCars]);

  useEffect(() => {
    async function submitReservationAfterApproval() {
      if (approvalStatus === "approved" && pendingReservation) {
        try {
          await dispatch(createNewReservation(pendingReservation)).unwrap();
          toast({ title: "Mobile approved. Reservation sent to admins!" });
          dispatch(getAllReservationsByUserId(user._id));
          dispatch(markReservationSubmittedToAdmins());
        } catch (err) {
          toast({
            title: err.message || "Failed to make reservation",
            variant: "destructive",
          });
          dispatch(resetMobileApproval());
        }
      }

      if (approvalStatus === "rejected") {
        toast({
          title: "Reservation rejected from mobile",
          variant: "destructive",
        });
        dispatch(markReservationSubmittedToAdmins());
      }
    }

    submitReservationAfterApproval();
  }, [approvalStatus, pendingReservation, dispatch, toast, user?._id]);

  async function handleReserveVehicle(v, reservationData) {
    if (!isAuthenticated) {
      return toast({
        title: "Please log in first",
        variant: "destructive",
      });
    }

    if (!connected) {
      return toast({
        title: "Mobile phone is not connected",
        variant: "destructive",
      });
    }

    const addressInfo = addressList?.[0];

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

    if (!reservationData) {
      return toast({
        title: "Please select reservation dates and times",
        variant: "destructive",
      });
    }

    const { startDate, startTime, endDate, endTime } = reservationData;

    const start = new Date(`${startDate}T${startTime}`);
    const end = new Date(`${endDate}T${endTime}`);

    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
      return toast({
        title: "Invalid reservation interval",
        variant: "destructive",
      });
    }

    const pricePerDay = v.salePrice > 0 ? v.salePrice : v.price;
    const diffMs = end - start;
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    const rentalDays = Math.max(1, diffDays);
    const totalAmount = pricePerDay * rentalDays;

    const payload = {
      userId: user._id,
      vehicles: [
        {
          vehicleId: v._id,
          quantity: 1,
          price: pricePerDay,
        },
      ],
      totalAmount,
      startDate: start,
      endDate: end,
      addressInfo,
      vehicleTitle: v.title,
    };

    dispatch(setPendingMobileApproval(payload));

    toast({
      title: "Waiting for mobile approval. Press A to approve or X to reject.",
    });
  }

  function handleSaveVehicle(id) {
    setSavedCars((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id],
    );

    toast({
      title: savedCars.includes(id) ? "Removed from saved cars" : "Car saved",
    });
  }

  function handleGetVehicleDetails(id) {
    dispatch(fetchVehicleDetails(id));
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="relative h-[600px] w-full overflow-hidden">
        {featureImageList.map((slide, i) => (
          <img
            key={i}
            src={slide.image}
            alt={`Feature ${i + 1}`}
            className={`absolute left-0 top-0 h-full w-full object-cover transition-opacity duration-1000 ${
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
                : 0,
            )
          }
          className="absolute left-4 top-1/2 bg-white/80"
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={() =>
            setCurrentSlide((p) =>
              featureImageList.length ? (p + 1) % featureImageList.length : 0,
            )
          }
          className="absolute right-4 top-1/2 bg-white/80"
        >
          <ChevronRightIcon className="h-4 w-4" />
        </Button>
      </div>
      <div className="container mx-auto mt-6 px-4">
        <MobileGpsPanel />
      </div>
      <section className="py-12">
        <h2 className="mb-8 text-center text-3xl font-bold">
          Featured Vehicles
        </h2>

        <div className="container mx-auto grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {vehicleList.map((v) => (
            <ShoppingVehicleTile
              key={v._id}
              vehicle={v}
              handleGetVehicleDetails={() => handleGetVehicleDetails(v._id)}
              handleReserveVehicle={(vehicleId, reservationData) =>
                handleReserveVehicle(v, reservationData)
              }
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
        onReserve={(reservationData) =>
          handleReserveVehicle(vehicleDetails, reservationData)
        }
      />
    </div>
  );
}
