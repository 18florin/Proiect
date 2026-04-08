//client/src/components/shopping-view/address.jsx
import { useEffect, useState } from "react";
import CommonForm from "../common/form";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { addressFormControls } from "@/config";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllAddresses,
  addNewAddress,
  updateAddress,
  deleteAddress,
} from "@/store/shop/address-slice";
import AddressCard from "./address-card";
import { useToast } from "../ui/use-toast";

const initialFormData = {
  address: "",
  city: "",
  phone: "",
  pincode: "",
  notes: "",
};

export default function Address({ setCurrentSelectedAddress, selectedId }) {
  const [formData, setFormData] = useState(initialFormData);
  const [editingId, setEditingId] = useState(null);
  const dispatch = useDispatch();
  const { addressList, isLoading, error } = useSelector(
    (state) => state.shopAddress,
  );
  const { toast } = useToast();

  useEffect(() => {
    dispatch(fetchAllAddresses());
  }, [dispatch]);

  function onSubmit(e) {
    e.preventDefault();
    if (editingId) {
      dispatch(updateAddress({ addressId: editingId, formData })).then(() => {
        toast({ title: "Address updated." });
        setEditingId(null);
        setFormData(initialFormData);
      });
    } else {
      dispatch(addNewAddress(formData)).then(() => {
        toast({ title: "Address added." });
        setFormData(initialFormData);
      });
    }
  }

  function onEdit(a) {
    setEditingId(a._id);
    setFormData({
      address: a.address,
      city: a.city,
      phone: a.phone,
      pincode: a.pincode,
      notes: a.notes || "",
    });
  }

  function onDelete(a) {
    dispatch(deleteAddress(a._id)).then(() => {
      toast({ title: "Address deleted." });
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{editingId ? "Edit Address" : "Add New Address"}</CardTitle>
      </CardHeader>
      <CardContent>
        {addressList.map((a) => (
          <AddressCard
            key={a._id}
            addressInfo={a}
            handleEditAddress={() => onEdit(a)}
            handleDeleteAddress={() => onDelete(a)}
            setCurrentSelectedAddress={setCurrentSelectedAddress}
            selectedId={selectedId}
          />
        ))}

        <CommonForm
          formControls={addressFormControls}
          formData={formData}
          setFormData={setFormData}
          buttonText={editingId ? "Save Changes" : "Add Address"}
          onSubmit={onSubmit}
          isBtnDisabled={!Object.values(formData).every((v) => v.trim())}
        />

        {error && (
          <p className="text-red-600 mt-2">Something went wrong: {error}</p>
        )}
      </CardContent>
    </Card>
  );
}
