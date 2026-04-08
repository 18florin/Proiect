//client/src/components/shopping-view/reservation-dialog.jsx
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export default function ReservationDialog({
  open,
  setOpen,
  vehicle,
  onConfirm,
}) {
  const today = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, []);

  const [startDate, setStartDate] = useState(today);
  const [startTime, setStartTime] = useState("10:00");
  const [endDate, setEndDate] = useState(today);
  const [endTime, setEndTime] = useState("12:00");
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setError("");
      setStartDate(today);
      setStartTime("10:00");
      setEndDate(today);
      setEndTime("12:00");
    }
  }, [open, today]);

  const handleClose = () => {
    setError("");
    setOpen(false);
  };

  const handleStartDateChange = (e) => {
    const newStartDate = e.target.value;
    setStartDate(newStartDate);

    if (endDate && newStartDate && endDate < newStartDate) {
      setEndDate(newStartDate);
    }

    setError("");
  };

  const handleEndDateChange = (e) => {
    setEndDate(e.target.value);
    setError("");
  };

  const handleConfirm = () => {
    setError("");

    if (!startDate || !endDate || !startTime || !endTime) {
      setError("Please complete all date and time fields.");
      return;
    }

    const start = new Date(`${startDate}T${startTime}`);
    const end = new Date(`${endDate}T${endTime}`);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      setError("Please select a valid date and time interval.");
      return;
    }

    if (end <= start) {
      setError("End date and time must be after start date and time.");
      return;
    }

    onConfirm({
      startDate,
      startTime,
      endDate,
      endTime,
    });

    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Reserve {vehicle?.title || "vehicle"}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium">Start date</label>
            <input
              type="date"
              min={today}
              value={startDate}
              onChange={handleStartDateChange}
              className="w-full rounded-md border px-3 py-2"
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Start time</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => {
                setStartTime(e.target.value);
                setError("");
              }}
              className="w-full rounded-md border px-3 py-2"
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">End date</label>
            <input
              type="date"
              min={startDate || today}
              value={endDate}
              onChange={handleEndDateChange}
              className="w-full rounded-md border px-3 py-2"
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">End time</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => {
                setEndTime(e.target.value);
                setError("");
              }}
              className="w-full rounded-md border px-3 py-2"
            />
          </div>

          {error && <p className="text-sm font-medium text-red-500">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>Confirm reservation</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
