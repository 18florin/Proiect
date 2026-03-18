import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShieldOff } from "lucide-react";

function UnauthPage() {
  const navigate = useNavigate();

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50 p-4">
      <div className="flex flex-col items-center bg-white shadow-md rounded-lg p-8 max-w-md text-center">
        <ShieldOff className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
        <p className="text-gray-600 mb-6">
          You don’t have permission to view this page.
        </p>
        <Button
          variant="outline"
          onClick={() => navigate("/")}
          className="mt-4"
        >
          Go to Home
        </Button>
      </div>
    </div>
  );
}

export default UnauthPage;
