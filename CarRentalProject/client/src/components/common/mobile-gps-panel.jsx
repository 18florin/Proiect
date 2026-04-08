//client/src/components/common/mobile-gps-panel.jsx
import { useSelector } from "react-redux";

export default function MobileGpsPanel() {
  const { gpsData, approvalStatus, connected } = useSelector(
    (state) => state.mobile,
  );

  if (!connected) {
    return (
      <div className="rounded-lg border bg-white p-4 shadow-sm">
        <h3 className="mb-2 text-lg font-semibold">Device Location</h3>
        <p className="text-sm text-gray-500">Phone not connected.</p>
      </div>
    );
  }

  if (approvalStatus !== "approved") {
    return (
      <div className="rounded-lg border bg-white p-4 shadow-sm">
        <h3 className="mb-2 text-lg font-semibold">Device Location</h3>
        <p className="text-sm text-gray-500">
          Location becomes available after mobile approval.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-lg font-semibold">Device Location</h3>

      {gpsData ? (
        <div className="space-y-2 text-sm text-gray-700">
          <p>
            <span className="font-medium">Latitude:</span> {gpsData.lat}
          </p>
          <p>
            <span className="font-medium">Longitude:</span> {gpsData.lng}
          </p>
          <p>
            <span className="font-medium">Accuracy:</span>{" "}
            {gpsData.accuracy ? `${Math.round(gpsData.accuracy)} m` : "Unknown"}
          </p>
          <p>
            <span className="font-medium">Last update:</span>{" "}
            {new Date(gpsData.timestamp).toLocaleString()}
          </p>
        </div>
      ) : (
        <p className="text-sm text-gray-500">
          Press G to get the current device location.
        </p>
      )}
    </div>
  );
}
