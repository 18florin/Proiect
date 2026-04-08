//client/src/components/auth/layout.jsx
import { Outlet } from "react-router-dom";
import MobileStatus from "@/components/common/mobile-status";
import MobileConnectDialog from "@/components/auth/mobile-connect-dialog";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Smartphone } from "lucide-react";

function AuthLayout() {
  const [openQr, setOpenQr] = useState(false);

  return (
    <div className="flex min-h-screen w-full relative">
      <div className="absolute top-4 right-4 flex items-center gap-3 z-50">
        <MobileStatus />

        <Button
          variant="outline"
          size="sm"
          onClick={() => setOpenQr(true)}
          className="flex items-center gap-2"
        >
          <Smartphone className="w-4 h-4" />
          Connect Phone
        </Button>
      </div>

      <div className="hidden lg:flex items-center justify-center bg-black w-1/2 px-12">
        <div className="max-w-md space-y-6 text-center text-primary-foreground">
          <h1 className="text-4xl font-extrabold tracking-tight">
            Welcome to best Car Rental Service
          </h1>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
        <Outlet />
      </div>

      <MobileConnectDialog open={openQr} setOpen={setOpenQr} />
    </div>
  );
}

export default AuthLayout;
