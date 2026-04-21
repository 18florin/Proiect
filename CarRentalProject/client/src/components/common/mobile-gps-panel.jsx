import { useEffect, useRef } from "react";
import socket from "@/socket";
import { useMobile } from "@/context/mobile-context";

function MobileGpsPanel() {
  const { sessionId } = useMobile();

  const watchIdRef = useRef(null); // 🔥 salvăm watchId

  useEffect(() => {
    socket.on("start-gps", () => {
      console.log("🚀 START GPS AFTER APPROVAL");

      // ❗ evităm să pornim de mai multe ori
      if (watchIdRef.current !== null) return;

      if (!navigator.geolocation) {
        console.log("Geolocation not supported");
        return;
      }

      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          const coords = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };

          console.log("📱 Sending GPS:", coords);

          socket.emit("send-location", {
            sessionId,
            coords,
          });
        },
        (err) => console.error(err),
        { enableHighAccuracy: true },
      );
    });

    return () => {
      socket.off("start-gps");

      // 🔥 cleanup
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [sessionId]);

  return null;
}

export default MobileGpsPanel;
