//client/src/components/auth/mobile-connect-dialog.jsx
import QRCode from "react-qr-code";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function MobileConnectDialog({ open, setOpen }) {
  const sessionId = Math.random().toString(36).substring(2, 10);

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
          <DialogTitle>Connect Mobile Device</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-4">
          <QRCode value={`merb://connect?session=${sessionId}`} size={200} />

          <p className="text-sm text-gray-500">
            Scan this QR code with your mobile app
          </p>

          <div className="text-xs text-gray-400">Session ID: {sessionId}</div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
