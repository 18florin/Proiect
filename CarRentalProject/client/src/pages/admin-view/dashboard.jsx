import VehicleImageUpload from "@/components/admin-view/image-upload";
import { Button } from "@/components/ui/button";
import {
  addFeatureImage,
  getFeatureImages,
  deleteFeatureImage,
} from "@/store/common-slice";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function AdminDashboard() {
  const dispatch = useDispatch();
  const { featureImageList } = useSelector((s) => s.commonFeature);

  const [images, setImages] = useState([]);
  const [uploadedUrls, setUploadedUrls] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    dispatch(getFeatureImages());
  }, [dispatch]);

  function handleDeleteFeatureImage(id) {
    if (!confirm("Sigur vrei să ștergi imaginea?")) return;
    dispatch(deleteFeatureImage(id));
  }

  async function handleUploadFeatureImages() {
    if (!uploadedUrls.length) return;
    await Promise.all(
      uploadedUrls.map((url) => dispatch(addFeatureImage(url)).unwrap())
    );
    dispatch(getFeatureImages());
    setImages([]);
    setUploadedUrls([]);
  }

  return (
    <div className="space-y-6">
      <VehicleImageUpload
        images={images}
        setImages={setImages}
        uploading={uploading}
        setUploading={setUploading}
        uploadedUrls={uploadedUrls}
        setUploadedUrls={setUploadedUrls}
        isCustomStyling={true}
      />

      <Button
        onClick={handleUploadFeatureImages}
        className="w-full"
        disabled={uploading || uploadedUrls.length === 0}
      >
        Upload Feature Image{uploadedUrls.length > 1 ? "s" : ""}
      </Button>

      <div className="grid gap-4">
        {featureImageList.map((fi) => (
          <div key={fi._id} className="relative">
            <img
              src={fi.image}
              alt="Feature"
              className="w-full h-[300px] object-cover rounded-lg"
            />

            <Button
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2"
              onClick={() => handleDeleteFeatureImage(fi._id)}
            >
              Șterge
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
