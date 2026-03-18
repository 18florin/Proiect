/*//src/components/shopping-view/reservation-details.jsx
import { useSelector } from "react-redux";
import { Badge } from "../ui/badge";
import { DialogContent } from "../ui/dialog";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";

function ShoppingReservationDetailsView({ reservationDetails }) {
  const { user } = useSelector((state) => state.auth);

  const reserved = reservationDetails?.vehicles || [];

  return (
    <DialogContent className="sm:max-w-[600px]">
      <div className="grid gap-6">
        <div className="grid gap-2">
          <div className="flex mt-6 items-center justify-between">
            <p className="font-medium">Reservation ID</p>
            <Label>{reservationDetails?._id}</Label>
          </div>
          <div className="flex mt-2 items-center justify-between">
            <p className="font-medium">Reservation Date</p>
            <Label>{reservationDetails?.reservationDate.split("T")[0]}</Label>
          </div>
          <div className="flex mt-2 items-center justify-between">
            <p className="font-medium">Total Price</p>
            <Label>${reservationDetails?.totalAmount}</Label>
          </div>
          <div className="flex mt-2 items-center justify-between">
            <p className="font-medium">Payment Method</p>
            <Label>{reservationDetails?.paymentMethod}</Label>
          </div>
          <div className="flex mt-2 items-center justify-between">
            <p className="font-medium">Payment Status</p>
            <Label>{reservationDetails?.paymentStatus}</Label>
          </div>
          <div className="flex mt-2 items-center justify-between">
            <p className="font-medium">Reservation Status</p>
            <Label>
              <Badge
                className={`py-1 px-3 ${
                  reservationDetails?.status === "confirmed"
                    ? "bg-green-500"
                    : reservationDetails?.status === "rejected"
                    ? "bg-red-600"
                    : "bg-black"
                }`}
              >
                {reservationDetails?.status}
              </Badge>
            </Label>
          </div>
        </div>

        <Separator />

        <div className="grid gap-2">
          <div className="font-medium">Reserved Vehicles</div>
          <ul className="grid gap-3">
            {reserved.map((v, i) => (
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
            <span>{reservationDetails?.pickup.address}</span>
            <span>{reservationDetails?.pickup.city}</span>
            <span>{reservationDetails?.pickup.postalCode}</span>
            <span>{reservationDetails?.pickup.phone}</span>
            <span>{reservationDetails?.pickup.notes}</span>
          </div>
        </div>
      </div>
    </DialogContent>
  );
}

export default ShoppingReservationDetailsView;
*/
