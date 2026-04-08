//client/src/components/shopping-view/reservations.jsx
import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Badge } from "../ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import {
  getAllReservationsByUserId,
  getReservationDetails,
  resetReservationDetails,
  cancelReservation,
} from "@/store/shop/reservation-slice";
import { useToast } from "../ui/use-toast";

export default function ShoppingReservations() {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { user } = useSelector((state) => state.auth);
  const { reservationList, reservationDetails } = useSelector(
    (state) => state.shopReservation,
  );

  const [statusFilter, setStatusFilter] = useState("all");
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  useEffect(() => {
    dispatch(resetReservationDetails());
    setOpenDetailsDialog(false);
  }, [dispatch]);

  useEffect(() => {
    if (!user || !user._id) return;

    dispatch(getAllReservationsByUserId(user._id));
  }, [dispatch, user]);

  const filteredReservations = useMemo(() => {
    if (statusFilter === "all") return reservationList;
    return reservationList.filter((r) => r.reservationStatus === statusFilter);
  }, [reservationList, statusFilter]);

  async function handleViewDetails(id) {
    try {
      setIsLoadingDetails(true);
      dispatch(resetReservationDetails());
      setOpenDetailsDialog(true);

      const res = await dispatch(getReservationDetails(id)).unwrap();

      if (!res?.success) {
        toast({
          title: "Could not load reservation details",
          variant: "destructive",
        });
        setOpenDetailsDialog(false);
      }
    } catch (err) {
      toast({
        title: err?.message || "Could not load reservation details",
        variant: "destructive",
      });
      setOpenDetailsDialog(false);
    } finally {
      setIsLoadingDetails(false);
    }
  }

  function handleCancel(id) {
    if (!window.confirm("Are you sure you want to cancel this reservation?")) {
      return;
    }

    dispatch(cancelReservation(id))
      .unwrap()
      .then(() => {
        toast({ title: "Reservation cancelled" });
        dispatch(getAllReservationsByUserId(user._id));
      })
      .catch((err) => {
        toast({
          title: err.message || "Cancel failed",
          variant: "destructive",
        });
      });
  }

  function closeDialog() {
    setOpenDetailsDialog(false);
    setIsLoadingDetails(false);
    dispatch(resetReservationDetails());
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>My Reservations</CardTitle>
            <div className="flex items-center gap-2">
              <label htmlFor="statusFilter" className="font-medium">
                Filter by status:
              </label>
              <select
                id="statusFilter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border rounded px-2 py-1"
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReservations.map((r) => (
                <TableRow key={r._id}>
                  <TableCell>{r._id}</TableCell>
                  <TableCell>
                    {new Date(r.reservationDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={`py-1 px-3 ${
                        r.reservationStatus === "confirmed"
                          ? "bg-green-500"
                          : r.reservationStatus === "rejected"
                            ? "bg-red-600"
                            : r.reservationStatus === "pending"
                              ? "bg-yellow-500"
                              : "bg-gray-600"
                      }`}
                    >
                      {r.reservationStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>${r.totalAmount.toFixed(2)}</TableCell>
                  <TableCell className="flex gap-2">
                    <Button size="sm" onClick={() => handleViewDetails(r._id)}>
                      View
                    </Button>

                    {r.reservationStatus === "pending" && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleCancel(r._id)}
                      >
                        Cancel
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog
        open={openDetailsDialog}
        onOpenChange={(open) => {
          if (!open) {
            closeDialog();
          } else {
            setOpenDetailsDialog(true);
          }
        }}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Reservation Details</DialogTitle>
          </DialogHeader>

          {isLoadingDetails ? (
            <div className="py-6 text-sm text-muted-foreground">
              Loading reservation details...
            </div>
          ) : reservationDetails ? (
            <div className="space-y-3 text-sm">
              <div>
                <span className="font-medium">Reservation ID:</span>{" "}
                {reservationDetails._id}
              </div>

              <div>
                <span className="font-medium">Status:</span>{" "}
                {reservationDetails.reservationStatus}
              </div>

              <div>
                <span className="font-medium">Reservation date:</span>{" "}
                {new Date(reservationDetails.reservationDate).toLocaleString()}
              </div>

              <div>
                <span className="font-medium">Total amount:</span> $
                {reservationDetails.totalAmount?.toFixed?.(2) ??
                  reservationDetails.totalAmount}
              </div>

              {reservationDetails.startDate && (
                <div>
                  <span className="font-medium">Start date:</span>{" "}
                  {new Date(reservationDetails.startDate).toLocaleString()}
                </div>
              )}

              {reservationDetails.endDate && (
                <div>
                  <span className="font-medium">End date:</span>{" "}
                  {new Date(reservationDetails.endDate).toLocaleString()}
                </div>
              )}

              {reservationDetails.addressInfo && (
                <div className="rounded-md border p-3 space-y-1">
                  <div className="font-medium">Pickup Address</div>
                  <div>{reservationDetails.addressInfo.address}</div>
                  <div>{reservationDetails.addressInfo.city}</div>
                  <div>{reservationDetails.addressInfo.pincode}</div>
                  <div>{reservationDetails.addressInfo.phone}</div>
                </div>
              )}

              {reservationDetails.vehicles?.length > 0 && (
                <div className="rounded-md border p-3 space-y-2">
                  <div className="font-medium">Vehicles</div>
                  {reservationDetails.vehicles.map((item, index) => (
                    <div
                      key={index}
                      className="border-b pb-2 last:border-b-0 space-y-1"
                    >
                      <div>
                        <span className="font-medium">Vehicle:</span>{" "}
                        {typeof item.vehicleId === "object"
                          ? item.vehicleId.title
                          : item.vehicleId}
                      </div>

                      {typeof item.vehicleId === "object" &&
                        item.vehicleId._id && (
                          <div>
                            <span className="font-medium">Vehicle ID:</span>{" "}
                            {item.vehicleId._id}
                          </div>
                        )}

                      <div>
                        <span className="font-medium">Quantity:</span>{" "}
                        {item.quantity}
                      </div>

                      <div>
                        <span className="font-medium">Reservation price:</span>{" "}
                        ${item.price}
                      </div>

                      {typeof item.vehicleId === "object" && (
                        <div>
                          <span className="font-medium">
                            Current vehicle price:
                          </span>{" "}
                          $
                          {item.vehicleId.salePrice > 0
                            ? item.vehicleId.salePrice
                            : item.vehicleId.price}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-end pt-2">
                <Button variant="outline" onClick={closeDialog}>
                  Close
                </Button>
              </div>
            </div>
          ) : (
            <div className="py-6 text-sm text-muted-foreground">
              No reservation details found.
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
