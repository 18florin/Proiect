/*import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Dialog } from "../ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import AdminReservationDetailsView from "./reservation-details";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllReservationsForAdmin,
  getReservationDetailsForAdmin,
  resetReservationDetails,
} from "@/store/admin/reservation-slice";
import { Badge } from "../ui/badge";

function AdminReservationsView() {
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const { reservationList, reservationDetails } = useSelector(
    (state) => state.adminReservation,
  );
  const dispatch = useDispatch();

  function handleFetchReservationDetails(getId) {
    dispatch(getReservationDetailsForAdmin(getId));
  }

  useEffect(() => {
    dispatch(getAllReservationsForAdmin());
  }, [dispatch]);

  console.log(reservationDetails, "reservationList");

  useEffect(() => {
    if (reservationDetails !== null) setOpenDetailsDialog(true);
  }, [reservationDetails]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Reservations</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Reservation ID</TableHead>
              <TableHead>Reservation Date</TableHead>
              <TableHead>Reservation Status</TableHead>
              <TableHead>Reservation Price</TableHead>
              <TableHead>
                <span className="sr-only">Details</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reservationList && reservationList.length > 0
              ? reservationList.map((reservationItem) => (
                  <TableRow key={reservationItem?._id}>
                    <TableCell>{reservationItem?._id}</TableCell>
                    <TableCell>
                      {reservationItem?.reservationDate.split("T")[0]}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`py-1 px-3 ${
                          reservationItem?.reservationStatus === "confirmed"
                            ? "bg-green-500"
                            : reservationItem?.reservationStatus === "rejected"
                              ? "bg-red-600"
                              : "bg-black"
                        }`}
                      >
                        {reservationItem?.reservationStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>${reservationItem?.totalAmount}</TableCell>
                    <TableCell>
                      <Dialog
                        open={openDetailsDialog}
                        onOpenChange={() => {
                          setOpenDetailsDialog(false);
                          dispatch(resetReservationDetails());
                        }}
                      >
                        <Button
                          onClick={() =>
                            handleFetchReservationDetails(reservationItem?._id)
                          }
                        >
                          View Details
                        </Button>
                        <AdminReservationDetailsView
                          reservationDetails={reservationDetails}
                        />
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))
              : null}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export default AdminReservationsView;
*/
