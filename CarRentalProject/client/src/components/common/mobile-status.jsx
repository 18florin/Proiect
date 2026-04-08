//client/src/components/common/mobile-status.jsx
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  connectMobile,
  disconnectMobile,
  approveMobileReservation,
  rejectMobileReservation,
  setGpsData,
} from "@/store/mobile-slice";

export default function MobileStatus() {
  const dispatch = useDispatch();
  const { connected, approvalStatus } = useSelector((state) => state.mobile);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!e?.key || typeof e.key !== "string") return;

      const tag = e.target.tagName.toLowerCase();
      const isTyping =
        tag === "input" ||
        tag === "textarea" ||
        tag === "select" ||
        e.target.isContentEditable;

      if (isTyping) return;

      const key = e.key.toLowerCase();

      if (key === "c") {
        dispatch(connectMobile());
      }

      if (key === "d") {
        dispatch(disconnectMobile());
      }

      if (key === "a") {
        dispatch(approveMobileReservation());
      }

      if (key === "x") {
        dispatch(rejectMobileReservation());
      }

      if (key === "g") {
        if (!connected || approvalStatus !== "approved") return;

        if (!navigator.geolocation) {
          console.error("Geolocation not supported");
          return;
        }

        navigator.geolocation.getCurrentPosition(
          (position) => {
            dispatch(
              setGpsData({
                lat: position.coords.latitude,
                lng: position.coords.longitude,
                accuracy: position.coords.accuracy,
                timestamp: new Date().toISOString(),
              }),
            );
          },
          (error) => {
            console.error("Location error:", error);
          },
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dispatch, connected, approvalStatus]);

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 rounded-full border px-3 py-1.5 bg-white shadow-sm">
        <div
          className={`h-3 w-3 rounded-full ${
            connected ? "bg-green-500" : "bg-red-500"
          }`}
        />
        <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
          {connected ? "Mobile connected" : "Mobile disconnected"}
        </span>
      </div>

      {approvalStatus === "waiting" && (
        <div className="rounded-full border border-yellow-300 bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-800">
          Waiting mobile approval
        </div>
      )}

      {approvalStatus === "approved" && (
        <div className="rounded-full border border-green-300 bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
          Mobile approved
        </div>
      )}

      {approvalStatus === "rejected" && (
        <div className="rounded-full border border-red-300 bg-red-100 px-3 py-1 text-sm font-medium text-red-800">
          Mobile rejected
        </div>
      )}
    </div>
  );
}
