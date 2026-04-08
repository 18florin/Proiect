//client/src/components/admin-view/image-editor.jsx
import { useEffect, useRef, useState } from "react";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Button } from "@/components/ui/button";

function renderImage(image, blur = 0, rotation = 0, scale = 1) {
  if (
    !image ||
    !image.complete ||
    !image.naturalWidth ||
    !image.naturalHeight
  ) {
    return null;
  }

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  const width = image.naturalWidth;
  const height = image.naturalHeight;

  canvas.width = width;
  canvas.height = height;

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.filter = `blur(${blur}px)`;
  ctx.translate(width / 2, height / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.scale(scale, scale);
  ctx.drawImage(image, -width / 2, -height / 2, width, height);
  ctx.restore();

  return canvas.toDataURL("image/png");
}

function getCroppedImg(image, crop, blur = 0, rotation = 0, scale = 1) {
  if (
    !image ||
    !image.complete ||
    !image.naturalWidth ||
    !image.naturalHeight
  ) {
    return null;
  }

  if (!crop?.width || !crop?.height) {
    return renderImage(image, blur, rotation, scale);
  }

  const canvas = document.createElement("canvas");
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  const ctx = canvas.getContext("2d");

  const cropWidth = crop.width * scaleX;
  const cropHeight = crop.height * scaleY;

  canvas.width = cropWidth;
  canvas.height = cropHeight;

  // fundal alb
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.filter = `blur(${blur}px)`;
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.scale(scale, scale);

  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    -cropWidth / 2,
    -cropHeight / 2,
    cropWidth,
    cropHeight,
  );

  ctx.restore();

  return canvas.toDataURL("image/png");
}

export default function ImageEditor({ image, setEditedImage }) {
  const imgRef = useRef(null);

  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState(null);

  const [blur, setBlur] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(1);

  const [previewImage, setPreviewImage] = useState(image);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  useEffect(() => {
    setPreviewImage(image);
    setEditedImage(image);
    setBlur(0);
    setRotation(0);
    setScale(1);
    setCrop(undefined);
    setCompletedCrop(null);
    setIsImageLoaded(false);
  }, [image, setEditedImage]);

  useEffect(() => {
    if (!isImageLoaded || !imgRef.current) return;

    const updated = renderImage(imgRef.current, blur, rotation, scale);
    if (updated) {
      setEditedImage(updated);
    }
  }, [blur, rotation, scale, isImageLoaded, setEditedImage]);

  function handleImageLoad() {
    setIsImageLoaded(true);
    setEditedImage(image);
  }

  function handleApplyCrop() {
    if (!imgRef.current || !isImageLoaded) return;

    const cropped = getCroppedImg(
      imgRef.current,
      completedCrop,
      blur,
      rotation,
      scale,
    );

    if (!cropped) return;

    setPreviewImage(cropped);
    setEditedImage(cropped);
    setBlur(0);
    setRotation(0);
    setScale(1);
    setCrop(undefined);
    setCompletedCrop(null);
    setIsImageLoaded(false);
  }

  function handleRotate() {
    setRotation((prev) => prev + 90);
  }

  function handleScaleUp() {
    setScale((prev) => Number((prev + 0.1).toFixed(2)));
  }

  function handleScaleDown() {
    setScale((prev) => Math.max(0.2, Number((prev - 0.1).toFixed(2))));
  }

  function handleBlurIncrease() {
    setBlur((prev) => Math.min(prev + 2, 20));
  }

  function handleBlurDecrease() {
    setBlur((prev) => Math.max(prev - 2, 0));
  }

  function handleBlurReset() {
    setBlur(0);
  }

  function handleReset() {
    setPreviewImage(image);
    setEditedImage(image);
    setBlur(0);
    setRotation(0);
    setScale(1);
    setCrop(undefined);
    setCompletedCrop(null);
    setIsImageLoaded(false);
  }

  if (!image) return null;

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-xl font-semibold">Image Editor</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Drag to crop. Use buttons for rotate, scale and blur.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button onClick={handleRotate}>Rotate</Button>
        <Button onClick={handleScaleUp}>Scale +</Button>
        <Button onClick={handleScaleDown}>Scale -</Button>
        <Button onClick={handleBlurIncrease}>Blur +</Button>
        <Button onClick={handleBlurDecrease}>Blur -</Button>
        <Button variant="outline" onClick={handleBlurReset}>
          Clear Blur
        </Button>
        <Button onClick={handleApplyCrop}>Apply All</Button>
        <Button variant="outline" onClick={handleReset}>
          Reset
        </Button>
      </div>

      <div className="flex gap-6 text-sm text-muted-foreground">
        <span>Blur: {blur}px</span>
        <span>Scale: {scale.toFixed(1)}x</span>
        <span>Rotation: {rotation}°</span>
      </div>

      <div className="overflow-hidden rounded-xl border bg-muted/30 p-4">
        <div className="mx-auto flex max-w-[720px] justify-center">
          <ReactCrop
            crop={crop}
            onChange={(c) => setCrop(c)}
            onComplete={(c) => setCompletedCrop(c)}
            keepSelection
          >
            <img
              ref={imgRef}
              src={previewImage}
              alt="Edit"
              onLoad={handleImageLoad}
              style={{
                maxHeight: "420px",
                width: "auto",
                transform: `rotate(${rotation}deg) scale(${scale})`,
                filter: `blur(${blur}px)`,
              }}
            />
          </ReactCrop>
        </div>
      </div>
    </div>
  );
}
