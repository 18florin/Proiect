//src/components/shopping-view/reservations.jsx
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

  useEffect(() => {
    if (user?._id) {
      dispatch(getAllReservationsByUserId(user._id));
    }
  }, [dispatch, user?._id]);

  useEffect(() => {
    if (reservationDetails) {
      setOpenDetailsDialog(true);
    }
  }, [reservationDetails]);

  const filteredReservations = useMemo(() => {
    if (statusFilter === "all") return reservationList;
    return reservationList.filter((r) => r.reservationStatus === statusFilter);
  }, [reservationList, statusFilter]);

  function handleViewDetails(id) {
    dispatch(getReservationDetails(id));
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
    dispatch(resetReservationDetails());
  }

  return (
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
  );
}
