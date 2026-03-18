/*//src/components/admin-view/reservation-details.jsx
import { useState } from "react";
import CommonForm from "../common/form";
import { DialogContent } from "../ui/dialog";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import { Badge } from "../ui/badge";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllReservationsForAdmin,
  getReservationDetailsForAdmin,
  updateReservationStatus,
} from "@/store/admin/reservation-slice";
import { useToast } from "../ui/use-toast";

const initialFormData = {
  status: "",
};

export default function AdminReservationDetailsView({ reservationDetails }) {
  const [formData, setFormData] = useState(initialFormData);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const { toast } = useToast();

  function handleUpdateStatus(e) {
    e.preventDefault();
    dispatch(
      updateReservationStatus({
        id: reservationDetails._id,
        reservationStatus: formData.status,
      }),
    ).then((res) => {
      if (res.payload.success) {
        dispatch(getReservationDetailsForAdmin(reservationDetails._id));
        dispatch(getAllReservationsForAdmin());
        setFormData(initialFormData);
        toast({ title: res.payload.message });
      }
    });
  }

  return (
    <DialogContent className="sm:max-w-[600px]">
      <div className="grid gap-6">
        <div className="grid gap-2">
          <div className="flex mt-6 items-center justify-between">
            <p className="font-medium">Reservation ID</p>
            <Label>{reservationDetails._id}</Label>
          </div>
          <div className="flex items-center justify-between">
            <p className="font-medium">Dateeeee</p>
            <Label>{reservationDetails.reservationDate.split("T")[0]}</Label>
          </div>
          <div className="flex items-center justify-between">
            <p className="font-medium">Total Price</p>
            <Label>${reservationDetails.totalAmount}</Label>
          </div>
          <div className="flex items-center justify-between">
            <p className="font-medium">Payment Method</p>
            <Label>{reservationDetails.paymentMethod}</Label>
          </div>
          <div className="flex items-center justify-between">
            <p className="font-medium">Payment Status</p>
            <Label>{reservationDetails.paymentStatus}</Label>
          </div>
          <div className="flex items-center justify-between">
            <p className="font-medium">Reservation Status</p>
            <Label>
              <Badge
                className={`py-1 px-3 ${
                  reservationDetails.reservationStatus === "confirmed"
                    ? "bg-green-500"
                    : reservationDetails.reservationStatus === "rejected"
                      ? "bg-red-600"
                      : "bg-black"
                }`}
              >
                {reservationDetails.reservationStatus}
              </Badge>
            </Label>
          </div>
        </div>

        <Separator />

        <div className="grid gap-2">
          <div className="font-medium">Reserved Vehicles</div>
          <ul className="grid gap-3">
            {reservationDetails.vehicles?.map((v, i) => (
              <li key={i} className="flex items-center justify-between">
                <span>Title: {v.title}</span>
                <span>Qty: {v.quantity}</span>
                <span>Price: ${v.price}</span>
              </li>
            ))}
          </ul>
        </div>

        <Separator />

        <div className="grid gap-2">
          <div className="font-medium">Pickup Info</div>
          <div className="grid gap-0.5 text-muted-foreground">
            <span>{user.userName}</span>
            <span>{reservationDetails.addressInfo.address}</span>
            <span>{reservationDetails.addressInfo.city}</span>
            <span>{reservationDetails.addressInfo.pincode}</span>
            <span>{reservationDetails.addressInfo.phone}</span>
            <span>{reservationDetails.addressInfo.notes}</span>
          </div>
        </div>

        <Separator />

        <CommonForm
          formControls={[
            {
              label: "Reservation Status",
              name: "status",
              componentType: "select",
              options: [
                { id: "pending", label: "Pending" },
                { id: "confirmed", label: "Confirmed" },
                { id: "rejected", label: "Rejected" },
              ],
            },
          ]}
          formData={formData}
          setFormData={setFormData}
          buttonText="Update Status"
          onSubmit={handleUpdateStatus}
        />
      </div>
    </DialogContent>
  );
}
*/
