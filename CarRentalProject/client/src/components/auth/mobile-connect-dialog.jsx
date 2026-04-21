//client/src/components/auth/mobile-connect-dialog.jsx
import QRCode from "react-qr-code";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useMobile } from "@/context/mobile-context";

export default function MobileConnectDialog({ open, setOpen }) {
  const { sessionId, isMobileConnected } = useMobile();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="
        sm:max-w-[400px] text-center
        data-[state=open]:animate-in
        data-[state=open]:slide-in-from-right-10
        data-[state=closed]:animate-out
        data-[state=closed]:slide-out-to-right-10
        duration-300
        "
      >
        <DialogHeader>
          <DialogTitle>Connect your phone</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-4">
          {/* 🔥 QR sau STATUS */}
          {!isMobileConnected ? (
            <>
              {sessionId && <QRCode value={sessionId} size={200} />}

              <p className="text-sm text-gray-500">
                Scan this QR with the mobile app
              </p>

              <div className="text-xs text-gray-400 break-all">{sessionId}</div>
            </>
          ) : (
            <div className="text-green-600 font-semibold text-lg">
              ✅ Phone connected
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
