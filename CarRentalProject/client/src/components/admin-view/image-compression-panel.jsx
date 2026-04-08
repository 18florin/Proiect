//client/src/components/admin-view/image-compression-panel.jsx
import { useState } from "react";
import { Button } from "@/components/ui/button";

function runLengthEncodePixels(pixelArray) {
  if (!pixelArray.length) return [];

  const encoded = [];
  let current = pixelArray[0];
  let count = 1;

  for (let i = 1; i < pixelArray.length; i++) {
    const samePixel =
      pixelArray[i][0] === current[0] &&
      pixelArray[i][1] === current[1] &&
      pixelArray[i][2] === current[2] &&
      pixelArray[i][3] === current[3];

    if (samePixel && count < 65535) {
      count++;
    } else {
      encoded.push([current, count]);
      current = pixelArray[i];
      count = 1;
    }
  }

  encoded.push([current, count]);
  return encoded;
}

function runLengthDecodePixels(encoded) {
  const decoded = [];

  for (const [pixel, count] of encoded) {
    for (let i = 0; i < count; i++) {
      decoded.push(pixel);
    }
  }

  return decoded;
}

export default function ImageCompressionPanel({ image }) {
  const [stats, setStats] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  async function compressImage() {
    if (!image) return;

    setIsProcessing(true);
    setStats(null);
    setPreview(null);

    try {
      const img = new Image();
      img.src = image;

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      await new Promise((resolve) => setTimeout(resolve, 1800));

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      const maxWidth = 300;
      const scale = Math.min(1, maxWidth / img.width);
      const width = Math.max(1, Math.floor(img.width * scale));
      const height = Math.max(1, Math.floor(img.height * scale));

      canvas.width = width;
      canvas.height = height;

      ctx.drawImage(img, 0, 0, width, height);

      const imageData = ctx.getImageData(0, 0, width, height);
      const pixels = imageData.data;

      const pixelArray = [];

      for (let i = 0; i < pixels.length; i += 4) {
        pixelArray.push([
          pixels[i],
          pixels[i + 1],
          pixels[i + 2],
          pixels[i + 3],
        ]);
      }

      const encoded = runLengthEncodePixels(pixelArray);
      const decoded = runLengthDecodePixels(encoded);

      const reconstructed = ctx.createImageData(width, height);

      for (let i = 0; i < decoded.length; i++) {
        const idx = i * 4;
        reconstructed.data[idx] = decoded[i][0];
        reconstructed.data[idx + 1] = decoded[i][1];
        reconstructed.data[idx + 2] = decoded[i][2];
        reconstructed.data[idx + 3] = decoded[i][3];
      }

      ctx.putImageData(reconstructed, 0, 0);

      const originalSize = pixelArray.length * 4;
      const compressedSize = encoded.length * 6;

      const compressionRatio =
        compressedSize > 0 ? (originalSize / compressedSize).toFixed(2) : "0";

      const savedPercent =
        originalSize > 0
          ? (((originalSize - compressedSize) / originalSize) * 100).toFixed(2)
          : "0";

      setPreview(canvas.toDataURL("image/png"));
      setStats({
        width,
        height,
        originalSize,
        compressedSize,
        compressionRatio,
        savedPercent,
        runs: encoded.length,
      });
    } catch (error) {
      console.error("Compression error:", error);
      setStats(null);
      setPreview(null);
    } finally {
      setIsProcessing(false);
    }
  }

  if (!image) return null;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Compression (RLE)</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          The image is compressed using Run-Length Encoding directly on RGBA
          pixel data.
        </p>
      </div>

      <Button onClick={compressImage} disabled={isProcessing}>
        {isProcessing ? "Compressing..." : "Compress Image"}
      </Button>

      {isProcessing && (
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-sm font-semibold">Processing Compression</h4>
            <span className="text-xs text-muted-foreground">RLE</span>
          </div>

          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-black"
              style={{
                width: "35%",
                animation: "loadingBar 1.8s ease-in-out infinite",
              }}
            />
          </div>

          <p className="mt-3 text-sm text-muted-foreground">
            Compressing image data and generating reconstructed preview...
          </p>
        </div>
      )}

      {stats && (
        <div className="space-y-2 rounded-lg border bg-slate-50 p-4 text-sm">
          <p>
            <span className="font-medium">Processed size:</span> {stats.width} ×{" "}
            {stats.height}
          </p>
          <p>
            <span className="font-medium">Original data size:</span>{" "}
            {stats.originalSize} bytes
          </p>
          <p>
            <span className="font-medium">Compressed size:</span>{" "}
            {stats.compressedSize} bytes
          </p>
          <p>
            <span className="font-medium">Compression ratio:</span>{" "}
            {stats.compressionRatio}:1
          </p>
          <p>
            <span className="font-medium">Space saved:</span>{" "}
            {stats.savedPercent}%
          </p>
          <p>
            <span className="font-medium">RLE runs:</span> {stats.runs}
          </p>
        </div>
      )}

      {preview && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold">Reconstructed Preview</h4>
          <div className="flex min-h-[240px] items-center justify-center overflow-hidden rounded-xl border bg-gradient-to-br from-slate-50 to-slate-100 p-4">
            <img
              src={preview}
              alt="Compressed preview"
              className="max-h-[220px] w-auto rounded-lg object-contain shadow-md transition-transform duration-300 hover:scale-[1.02]"
            />
          </div>
        </div>
      )}
    </div>
  );
}
