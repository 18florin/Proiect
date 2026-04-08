import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import VehicleFilter from "@/components/shopping-view/filter";
import VehicleDetailsDialog from "@/components/shopping-view/vehicle-details";
import ShoppingVehicleTile from "@/components/shopping-view/vehicle-tile";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";

import { fetchAllAddresses } from "@/store/shop/address-slice";

import { sortOptions } from "@/config";
import {
  fetchAllFilteredVehicles,
  fetchVehicleDetails,
} from "@/store/shop/vehicles-slice";
import {
  createNewReservation,
  getAllReservationsByUserId,
} from "@/store/shop/reservation-slice";
import {
  markReservationSubmittedToAdmins,
  resetMobileApproval,
  setPendingMobileApproval,
} from "@/store/mobile-slice";

import { ArrowUpDownIcon } from "lucide-react";

export default function ShoppingListing() {
  const dispatch = useDispatch();

  const { vehicleList, vehicleDetails, pagination } = useSelector(
    (s) => s.shopVehicles,
  );
  const { user, isAuthenticated } = useSelector((s) => s.auth);
  const { addressList } = useSelector((s) => s.shopAddress);
  const { connected, approvalStatus, pendingReservation } = useSelector(
    (s) => s.mobile,
  );

  const { toast } = useToast();

  const [filters, setFilters] = useState({});
  const [maxPrice, setMaxPrice] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [sort, setSort] = useState("price-lowtohigh");
  const [currentPage, setCurrentPage] = useState(1);

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
    dispatch(
      fetchAllFilteredVehicles({
        filterParams: filters,
        sortParams: sort,
        maxPrice,
        location: locationQuery,
        page: currentPage,
      }),
    );
  }, [dispatch, filters, sort, maxPrice, locationQuery, currentPage]);

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
        dispatch(resetMobileApproval());
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

  function handleFilterChange(section, option) {
    const nextFilters = { ...filters };
    const currentOptions = nextFilters[section] || [];

    nextFilters[section] = currentOptions.includes(option)
      ? currentOptions.filter((x) => x !== option)
      : [...currentOptions, option];

    setFilters(nextFilters);
    setCurrentPage(1);
  }

  function handleResetFilters() {
    setFilters({});
    setMaxPrice("");
    setLocationQuery("");
    setCurrentPage(1);
  }

  function handleSortChange(value) {
    setSort(value);
    setCurrentPage(1);
  }

  function handleGetVehicleDetails(id) {
    dispatch(fetchVehicleDetails(id));
  }

  function handleSaveVehicle(id) {
    setSavedCars((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

    toast({
      title: savedCars.includes(id) ? "Removed from saved cars" : "Car saved",
    });
  }

  return (
    <div className="grid grid-cols-1 gap-6 p-4 md:grid-cols-[200px_1fr] md:p-6">
      <VehicleFilter filters={filters} handleFilter={handleFilterChange} />

      <div className="w-full space-y-4 rounded-lg bg-background shadow-sm">
        <div className="flex flex-wrap items-center gap-3 border-b p-4">
          <input
            type="number"
            min="0"
            placeholder="Max price"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-24 rounded border px-2 py-1"
          />

          <input
            type="text"
            placeholder="Location"
            value={locationQuery}
            onChange={(e) => setLocationQuery(e.target.value)}
            className="w-32 rounded border px-2 py-1"
          />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
              >
                <ArrowUpDownIcon className="h-4 w-4" />
                <span>Sort by</span>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuRadioGroup
                value={sort}
                onValueChange={handleSortChange}
              >
                {sortOptions.map((option) => (
                  <DropdownMenuRadioItem key={option.id} value={option.id}>
                    {option.label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="ghost" size="sm" onClick={handleResetFilters}>
            Reset Filters
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
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

        <div className="flex justify-center gap-2 py-4">
          <Button
            variant="outline"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>

          <span className="px-3 py-1">
            Page {currentPage} of {pagination?.pages || 1}
          </span>

          <Button
            variant="outline"
            disabled={pagination && currentPage >= pagination.pages}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>

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
