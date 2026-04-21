//client/src/components/common/mobile-status.jsx
import { useMobile } from "@/context/mobile-context";

export default function MobileStatus({ approvalStatus }) {
  const { isMobileConnected } = useMobile(); // 🔥 direct din context

  return (
    <div className="flex items-center gap-3">
      {/* STATUS CONEXIUNE */}
      <div className="flex items-center gap-2 rounded-full border px-3 py-1.5 bg-white shadow-sm">
        <div
          className={`h-2.5 w-2.5 rounded-full ${
            isMobileConnected ? "bg-green-500" : "bg-gray-400"
          }`}
        />
        <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
          {isMobileConnected ? "Phone connected" : "Login with phone"}
        </span>
      </div>

      {/* STATUS APROBARE */}
      {approvalStatus === "waiting" && (
        <div className="rounded-full border border-yellow-300 bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-800">
          Waiting for phone approval
        </div>
      )}

      {approvalStatus === "approved" && (
        <div className="rounded-full border border-green-300 bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
          Approved
        </div>
      )}

      {approvalStatus === "rejected" && (
        <div className="rounded-full border border-red-300 bg-red-100 px-3 py-1 text-sm font-medium text-red-800">
          Rejected
        </div>
      )}
    </div>
  );
}
