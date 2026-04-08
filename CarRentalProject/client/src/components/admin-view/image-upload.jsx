//client/src/components/admin-view/image-upload.jsx
import { UploadCloudIcon, XIcon } from "lucide-react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { useRef } from "react";
import axios from "axios";

export default function VehicleImageUpload({
  images = [],
  setImages,
  uploading = false,
  setUploading,
  uploadedUrls = [],
  setUploadedUrls,
  isCustomStyling = false,
}) {
  const inputRef = useRef();

  function handleFilesChange(e) {
    setImages(Array.from(e.target.files || []));
  }

  function handleDrop(e) {
    e.preventDefault();
    setImages(Array.from(e.dataTransfer.files || []));
  }

  function removeFile(idx) {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  }

  function removeUploaded(idx) {
    setUploadedUrls((prev) => prev.filter((_, i) => i !== idx));
  }

  async function uploadAll() {
    if (!images.length) return;
    setUploading(true);
    const form = new FormData();
    images.forEach((f) => form.append("images", f));
    try {
      const { data } = await axios.post(
        "/api/admin/vehicles/upload-images",
        form,
        { withCredentials: true },
      );
      if (data.success && Array.isArray(data.urls)) {
        setUploadedUrls(data.urls);
        setImages([]);
      } else {
        console.error("Unexpected response", data);
      }
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className={`w-full mt-4 ${isCustomStyling ? "" : "max-w-md mx-auto"}`}>
      <Label className="text-lg font-semibold mb-2 block">Upload Images</Label>

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className="border-2 border-dashed rounded-lg p-4"
      >
        <Input
          type="file"
          multiple
          ref={inputRef}
          className="hidden"
          onChange={handleFilesChange}
        />

        {images.length === 0 && uploadedUrls.length === 0 && (
          <Label
            className="flex flex-col items-center justify-center h-32 cursor-pointer"
            onClick={() => inputRef.current?.click()}
          >
            <UploadCloudIcon className="w-10 h-10 text-muted-foreground mb-2" />
            <span>Drag & drop or click to select images</span>
            <span className="text-xs text-muted-foreground mt-1">
              (you can select multiple)
            </span>
          </Label>
        )}

        {images.length > 0 && (
          <div className="space-y-2">
            {images.map((file, i) => (
              <div
                key={i}
                className="flex items-center justify-between bg-gray-50 p-2 rounded"
              >
                <span className="truncate">{file.name}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeFile(i)}
                >
                  <XIcon className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <div className="mt-4 flex gap-2">
              <Button onClick={uploadAll} disabled={uploading}>
                {uploading ? "Uploading…" : "Upload All"}
              </Button>
              <Button
                variant="destructive"
                onClick={() => setImages([])}
                disabled={uploading}
              >
                Clear
              </Button>
            </div>
          </div>
        )}

        {uploadedUrls.length > 0 && (
          <div className="space-y-2 mt-4">
            <h4 className="font-semibold">Uploaded URLs</h4>
            {uploadedUrls.map((url, i) => (
              <div
                key={i}
                className="flex items-center justify-between bg-gray-50 p-2 rounded"
              >
                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="truncate text-blue-600 underline"
                >
                  {url}
                </a>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeUploaded(i)}
                >
                  <XIcon className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
