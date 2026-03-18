import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllReservationsForAdmin,
  updateReservationStatus,
} from "@/store/admin/reservation-slice";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function AdminReservationsView() {
  const dispatch = useDispatch();
  const { list = [], loading, error } = useSelector((s) => s.adminReservations);

  useEffect(() => {
    dispatch(getAllReservationsForAdmin());
  }, [dispatch]);

  if (loading) return <p>Loading reservations…</p>;
  if (error) return <p className="text-red-600">Error: {error}</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">All Reservations</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {list.map((r) => {
            const user = r.userId || {};
            return (
              <TableRow key={r._id}>
                <TableCell className="max-w-xs truncate">{r._id}</TableCell>
                <TableCell>
                  {user.userName || "—"}
                  <br />
                  <small className="text-muted-foreground">
                    {user.email || "—"}
                  </small>
                </TableCell>
                <TableCell>
                  {new Date(r.reservationDate).toLocaleDateString()}
                </TableCell>
                <TableCell>${(r.totalAmount ?? 0).toFixed(2)}</TableCell>
                <TableCell>
                  <Badge
                    className={`py-1 px-3 ${
                      r.reservationStatus === "confirmed"
                        ? "bg-green-500"
                        : r.reservationStatus === "rejected"
                        ? "bg-red-600"
                        : "bg-gray-600"
                    }`}
                  >
                    {r.reservationStatus}
                  </Badge>
                </TableCell>
                <TableCell className="flex gap-2">
                  {r.reservationStatus === "pending" && (
                    <>
                      <Button
                        size="sm"
                        onClick={() =>
                          dispatch(
                            updateReservationStatus({
                              id: r._id,
                              reservationStatus: "confirmed",
                            })
                          )
                        }
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() =>
                          dispatch(
                            updateReservationStatus({
                              id: r._id,
                              reservationStatus: "rejected",
                            })
                          )
                        }
                      >
                        Reject
                      </Button>
                    </>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
