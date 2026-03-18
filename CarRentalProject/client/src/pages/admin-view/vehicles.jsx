import VehicleImageUpload from "@/components/admin-view/image-upload";
import AdminVehicleTile from "@/components/admin-view/vehicle-tile";
import CommonForm from "@/components/common/form";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useToast } from "@/components/ui/use-toast";
import { addVehicleFormElements } from "@/config";
import {
  addNewVehicle,
  deleteVehicle,
  editVehicle,
  fetchAllVehicles,
} from "@/store/admin/vehicles-slice";
import { Fragment, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const initialFormData = {
  identifier: "",
  title: "",
  description: "",
  category: "",
  brand: "",
  price: "",
  salePrice: "",
  isAvailable: "true",
  averageReview: 0,
};

export default function AdminVehicles() {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { vehicleList } = useSelector((s) => s.adminVehicles);

  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [currentEditedId, setCurrentEditedId] = useState(null);

  const [formData, setFormData] = useState(initialFormData);

  const [images, setImages] = useState([]);
  const [uploadedUrls, setUploadedUrls] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  useEffect(() => {
    dispatch(fetchAllVehicles());
  }, [dispatch]);

  function resetForm() {
    setFormData(initialFormData);
    setImages([]);
    setUploadedUrls([]);
    setUploadingImages(false);
    setCurrentEditedId(null);
    setOpenCreateDialog(false);
  }

  function isFormValid() {
    const {
      identifier,
      title,
      description,
      category,
      brand,
      price,
      isAvailable,
    } = formData;
    return (
      identifier.trim() &&
      title.trim() &&
      description.trim() &&
      category.trim() &&
      brand.trim() &&
      price !== "" &&
      (isAvailable === "true" || isAvailable === "false") &&
      uploadedUrls.length > 0
    );
  }

  async function onSubmit(e) {
    e.preventDefault();
    const payload = {
      ...formData,
      price: Number(formData.price),
      salePrice: formData.salePrice ? Number(formData.salePrice) : 0,
      isAvailable: formData.isAvailable === "true",
      images: uploadedUrls,
    };

    if (currentEditedId) {
      const res = await dispatch(
        editVehicle({ id: currentEditedId, formData: payload }),
      );
      if (res.payload.success) {
        toast({ title: "Vehicle updated" });
        dispatch(fetchAllVehicles());
        resetForm();
      }
    } else {
      const res = await dispatch(addNewVehicle(payload));
      if (res.payload.success) {
        toast({ title: "Vehicle added" });
        dispatch(fetchAllVehicles());
        resetForm();
      }
    }
  }

  function handleDelete(id) {
    dispatch(deleteVehicle(id)).then((res) => {
      if (res.payload.success) {
        toast({ title: "Vehicle deleted" });
        dispatch(fetchAllVehicles());
      }
    });
  }

  return (
    <Fragment>
      <div className="mb-5 flex justify-end">
        <Button onClick={() => setOpenCreateDialog(true)}>
          Add New Vehicle
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
        {vehicleList.map((v) => (
          <AdminVehicleTile
            key={v._id}
            vehicle={v}
            setFormData={(data) => setFormData(data)}
            setOpenCreateVehiclesDialog={setOpenCreateDialog}
            setCurrentEditedId={setCurrentEditedId}
            handleDelete={handleDelete}
          />
        ))}
      </div>

      <Sheet
        open={openCreateDialog}
        onOpenChange={(open) => {
          if (!open) resetForm();
          setOpenCreateDialog(open);
        }}
      >
        <SheetContent side="right" className="overflow-auto">
          <SheetHeader>
            <SheetTitle>
              {currentEditedId ? "Edit Vehicle" : "Add New Vehicle"}
            </SheetTitle>
          </SheetHeader>

          <VehicleImageUpload
            images={images}
            setImages={setImages}
            uploading={uploadingImages}
            setUploading={setUploadingImages}
            uploadedUrls={uploadedUrls}
            setUploadedUrls={setUploadedUrls}
          />

          <div className="py-6">
            <CommonForm
              onSubmit={onSubmit}
              formData={formData}
              setFormData={setFormData}
              formControls={addVehicleFormElements}
              buttonText={currentEditedId ? "Update" : "Create"}
              isBtnDisabled={!isFormValid()}
            />
          </div>
        </SheetContent>
      </Sheet>
    </Fragment>
  );
}
