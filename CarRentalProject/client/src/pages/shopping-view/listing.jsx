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

import { ArrowUpDownIcon } from "lucide-react";

export default function ShoppingListing() {
  const dispatch = useDispatch();
  const { vehicleList, vehicleDetails, pagination } = useSelector(
    (s) => s.shopVehicles
  );
  const { user, isAuthenticated } = useSelector((s) => s.auth);
  const { addressList } = useSelector((s) => s.shopAddress);
  const { toast } = useToast();

  const [filters, setFilters] = useState({});
  const [maxPrice, setMaxPrice] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [sort, setSort] = useState("price-lowtohigh");
  const [currentPage, setCurrentPage] = useState(1);

  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [savedCars, setSavedCars] = useState(
    JSON.parse(localStorage.getItem("savedCars") || "[]")
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
      })
    );
  }, [dispatch, filters, sort, maxPrice, locationQuery, currentPage]);

  useEffect(() => {
    if (vehicleDetails) setOpenDetailsDialog(true);
  }, [vehicleDetails]);

  useEffect(() => {
    localStorage.setItem("savedCars", JSON.stringify(savedCars));
  }, [savedCars]);

  async function handleReserveVehicle(v) {
    if (!isAuthenticated) {
      return toast({ title: "Please log in first", variant: "destructive" });
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
    const days = Math.max(1, (endDate - startDate) / (1000 * 60 * 60 * 24));
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

  function handleFilterChange(section, option) {
    const nxt = { ...filters };
    const arr = nxt[section] || [];
    nxt[section] = arr.includes(option)
      ? arr.filter((x) => x !== option)
      : [...arr, option];
    setFilters(nxt);
  }
  function handleResetFilters() {
    setFilters({});
    setMaxPrice("");
    setLocationQuery("");
    setCurrentPage(1);
  }
  function handleSortChange(v) {
    setSort(v);
  }
  function handleGetVehicleDetails(id) {
    dispatch(fetchVehicleDetails(id));
  }
  function handleSaveVehicle(id) {
    setSavedCars((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
    toast({
      title: savedCars.includes(id) ? "Removed from saved cars" : "Car saved",
    });
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 p-4 md:p-6">
      <VehicleFilter filters={filters} handleFilter={handleFilterChange} />

      <div className="bg-background w-full rounded-lg shadow-sm space-y-4">
        <div className="p-4 border-b flex flex-wrap items-center gap-3">
          <input
            type="number"
            min="0"
            placeholder="Max price"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-24 px-2 py-1 border rounded"
          />
          <input
            type="text"
            placeholder="Location"
            value={locationQuery}
            onChange={(e) => setLocationQuery(e.target.value)}
            className="w-32 px-2 py-1 border rounded"
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
                {sortOptions.map((o) => (
                  <DropdownMenuRadioItem key={o.id} value={o.id}>
                    {o.label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="ghost" size="sm" onClick={handleResetFilters}>
            Reset Filters
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
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
        onReserve={handleReserveVehicle}
      />
    </div>
  );
}
