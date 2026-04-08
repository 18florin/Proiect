//client/src/components/admin-view/media-manager.jsx
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ImageEditor from "./image-editor";
import ImageCompressionPanel from "./image-compression-panel";
import VideoManager from "./video-manager";
import {
  editVehicle,
  fetchAllVehicles,
  uploadEditedVehicleImage,
  uploadVehicleVideo,
} from "@/store/admin/vehicles-slice";

function MediaManager() {
  const dispatch = useDispatch();
  const { vehicleList, isLoading } = useSelector(
    (state) => state.adminVehicles,
  );

  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [image, setImage] = useState(null);
  const [editedImage, setEditedImage] = useState(null);
  const [video, setVideo] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [videoFileName, setVideoFileName] = useState("");
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    dispatch(fetchAllVehicles());
  }, [dispatch]);

  const selectedVehicle = useMemo(
    () =>
      vehicleList.find((vehicle) => vehicle._id === selectedVehicleId) || null,
    [vehicleList, selectedVehicleId],
  );

  function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setImage(url);
    setEditedImage(url);
    setSaveMessage("");
  }

  async function dataURLtoFile(dataUrl, filename) {
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    return new File([blob], filename, { type: blob.type || "image/png" });
  }

  async function handleSaveToVehicle() {
    if (!selectedVehicle || !editedImage) return;

    try {
      const file = await dataURLtoFile(
        editedImage,
        `${selectedVehicle.title || "vehicle"}-edited.png`,
      );

      const uploadResult = await dispatch(uploadEditedVehicleImage(file));

      if (!uploadEditedVehicleImage.fulfilled.match(uploadResult)) {
        setSaveMessage("Failed to upload edited image.");
        return;
      }

      const uploadedUrl = uploadResult.payload?.urls?.[0];

      if (!uploadedUrl) {
        setSaveMessage("No uploaded image URL returned.");
        return;
      }

      const existingImages = Array.isArray(selectedVehicle.images)
        ? selectedVehicle.images
        : [];

      const formData = {
        identifier: selectedVehicle.identifier,
        title: selectedVehicle.title,
        description: selectedVehicle.description,
        category: selectedVehicle.category,
        brand: selectedVehicle.brand,
        year: selectedVehicle.year,
        price: selectedVehicle.price,
        salePrice: selectedVehicle.salePrice,
        isAvailable: selectedVehicle.isAvailable,
        location: selectedVehicle.location,
        video: selectedVehicle.video || "",
        images: [...existingImages, uploadedUrl],
      };

      const resultAction = await dispatch(
        editVehicle({
          id: selectedVehicle._id,
          formData,
        }),
      );

      if (editVehicle.fulfilled.match(resultAction)) {
        setSaveMessage(`Edited image saved for ${selectedVehicle.title}.`);
        dispatch(fetchAllVehicles());
      } else {
        setSaveMessage("Failed to save image to vehicle.");
      }
    } catch (error) {
      console.error(error);
      setSaveMessage("Failed to save image to vehicle.");
    }
  }

  async function handleSaveVideoToVehicle() {
    if (!selectedVehicle || !videoFile) return;

    try {
      const uploadResult = await dispatch(uploadVehicleVideo(videoFile));

      if (!uploadVehicleVideo.fulfilled.match(uploadResult)) {
        setSaveMessage("Failed to upload video.");
        return;
      }

      const uploadedUrl = uploadResult.payload?.urls?.[0];

      if (!uploadedUrl) {
        setSaveMessage("No uploaded video URL returned.");
        return;
      }

      const formData = {
        identifier: selectedVehicle.identifier,
        title: selectedVehicle.title,
        description: selectedVehicle.description,
        category: selectedVehicle.category,
        brand: selectedVehicle.brand,
        year: selectedVehicle.year,
        price: selectedVehicle.price,
        salePrice: selectedVehicle.salePrice,
        isAvailable: selectedVehicle.isAvailable,
        location: selectedVehicle.location,
        images: selectedVehicle.images || [],
        video: uploadedUrl,
      };

      const resultAction = await dispatch(
        editVehicle({
          id: selectedVehicle._id,
          formData,
        }),
      );

      if (editVehicle.fulfilled.match(resultAction)) {
        setSaveMessage(`Video saved for ${selectedVehicle.title}.`);
        dispatch(fetchAllVehicles());
      } else {
        setSaveMessage("Failed to save video to vehicle.");
      }
    } catch (error) {
      console.error(error);
      setSaveMessage("Failed to save video to vehicle.");
    }
  }

  function handleDownloadEditedImage() {
    if (!editedImage) return;

    const link = document.createElement("a");
    link.href = editedImage;
    link.download = `${selectedVehicle?.title || "vehicle"}-edited-image.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="grid gap-6">
      <div className="space-y-4 rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Vehicle Media Workspace</h2>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select vehicle</label>
            <select
              value={selectedVehicleId}
              onChange={(e) => {
                setSelectedVehicleId(e.target.value);
                setSaveMessage("");
              }}
              className="w-full rounded-md border px-3 py-2"
            >
              <option value="">Choose a vehicle</option>
              {vehicleList.map((vehicle) => (
                <option key={vehicle._id} value={vehicle._id}>
                  {vehicle.title}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Upload image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="w-full rounded-md border px-3 py-2"
            />
          </div>
        </div>

        {saveMessage && (
          <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {saveMessage}
          </div>
        )}
      </div>

      {image && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4 rounded-lg border bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Original Image</h3>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                Source Preview
              </span>
            </div>

            <div className="flex min-h-[420px] items-center justify-center overflow-hidden rounded-xl border bg-gradient-to-br from-slate-50 to-slate-100 p-6">
              <img
                src={image}
                alt="Original"
                className="max-h-[360px] w-auto rounded-lg object-contain shadow-md transition-transform duration-300 hover:scale-[1.02]"
              />
            </div>
          </div>

          <div className="space-y-4 rounded-lg border bg-white p-6 shadow-sm">
            <ImageEditor image={image} setEditedImage={setEditedImage} />
          </div>
        </div>
      )}

      {editedImage && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4 rounded-lg border bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Edited Image Preview</h3>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                Processed Output
              </span>
            </div>

            <div className="flex min-h-[420px] items-center justify-center overflow-hidden rounded-xl border bg-gradient-to-br from-slate-50 to-slate-100 p-6">
              <img
                src={editedImage}
                alt="Edited"
                className="max-h-[360px] w-auto rounded-lg object-contain shadow-md transition-transform duration-300 hover:scale-[1.02]"
              />
            </div>

            <div className="flex flex-wrap justify-end gap-3">
              <button
                onClick={handleDownloadEditedImage}
                className="rounded-md border px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Download Edited Image
              </button>

              <button
                onClick={handleSaveToVehicle}
                disabled={!selectedVehicle || !editedImage || isLoading}
                className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-black/85 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Save to Vehicle
              </button>
            </div>
          </div>

          <div className="space-y-4 rounded-lg border bg-white p-6 shadow-sm">
            <ImageCompressionPanel image={editedImage} />
          </div>
        </div>
      )}

      <div className="space-y-4 rounded-lg border bg-white p-6 shadow-sm">
        <VideoManager
          video={video}
          setVideo={setVideo}
          videoFile={videoFile}
          setVideoFile={setVideoFile}
          videoFileName={videoFileName}
          setVideoFileName={setVideoFileName}
        />

        <div className="flex justify-end">
          <button
            onClick={handleSaveVideoToVehicle}
            disabled={!selectedVehicle || !video || isLoading}
            className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-black/85 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Save Video to Vehicle
          </button>
        </div>
      </div>
    </div>
  );
}

export default MediaManager;
