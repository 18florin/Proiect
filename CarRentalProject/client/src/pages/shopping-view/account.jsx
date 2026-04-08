//client/src/pages/shopping-view/account.jsx
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { logoutUser } from "@/store/auth-slice";

import accImg from "../../assets/account.jpg";
import Address from "@/components/shopping-view/address";
import ShoppingReservations from "@/components/shopping-view/reservations";
import SavedCars from "@/components/shopping-view/saved";

export default function ShoppingAccount() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user = useSelector((s) => s.auth.user);
  const [profileImage, setProfileImage] = useState(user?.profileImage || "");
  const fileInputRef = useRef(null);

  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setProfileImage(user?.profileImage || "");
  }, [user?.profileImage]);

  async function handleImageChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const form = new FormData();
    form.append("image", file);
    try {
      const { data } = await axios.post("/api/auth/profile-image", form, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });
      if (data.success) {
        setProfileImage(data.data);
        toast({ title: "Profile image updated!" });
      }
    } catch (err) {
      toast({
        title: err.response?.data?.message || "Failed to upload image",
        variant: "destructive",
      });
    }
  }

  async function handleDeleteAccount() {
    if (
      !window.confirm(
        "Are you sure you want to delete your account? This cannot be undone.",
      )
    )
      return;

    setDeleting(true);
    try {
      await axios.delete("/api/auth/delete-account", {
        withCredentials: true,
      });
      dispatch(logoutUser());
      toast({ title: "Your account has been deleted." });
      navigate("/auth/login", { replace: true });
    } catch (err) {
      toast({
        title: err.response?.data?.message || "Failed to delete account",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex flex-col">
      <div className="relative h-[300px] w-full overflow-hidden">
        <img
          src={accImg}
          alt="Account Banner"
          className="h-full w-full object-cover object-center"
        />
      </div>

      <div className="container mx-auto grid grid-cols-1 gap-8 py-8">
        <div className="flex flex-col rounded-lg border bg-background p-6 shadow-sm">
          <div className="flex items-center space-x-6 pb-6 border-b">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Your profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  No Image
                </div>
              )}
            </div>
            <div>
              <p className="font-medium">{user?.userName}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <div className="mt-2">
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleImageChange}
                />
                <Button size="sm" onClick={() => fileInputRef.current?.click()}>
                  Change Profile Image
                </Button>
              </div>
            </div>
          </div>

          <Tabs defaultValue="reservations" className="mt-6">
            <TabsList>
              <TabsTrigger value="reservations">Reservations</TabsTrigger>
              <TabsTrigger value="address">Address</TabsTrigger>
              <TabsTrigger value="saved">Saved Cars</TabsTrigger>
            </TabsList>
            <TabsContent value="reservations">
              <ShoppingReservations />
            </TabsContent>
            <TabsContent value="address">
              <Address />
            </TabsContent>
            <TabsContent value="saved">
              <SavedCars />
            </TabsContent>
          </Tabs>

          <div className="mt-8 text-center">
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={deleting}
            >
              {deleting ? "Deleting Account…" : "Delete My Account"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
