// src/pages/auth/ResetPassword.jsx
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [newPassword, setNewPassword] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const { data } = await axios.post(`/api/auth/reset-password/${token}`, {
        newPassword,
      });
      toast({ title: data.message });
      setNewPassword("");
      navigate("/auth/login");
    } catch (err) {
      toast({
        title: err.response?.data?.message || "Error resetting password",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="mx-auto max-w-md p-6 space-y-4">
      <h1 className="text-2xl font-bold">Reset Your Password</h1>
      <form onSubmit={handleSubmit} className="grid gap-4">
        <Input
          type="password"
          required
          placeholder="New password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <Button type="submit" className="w-full">
          Set New Password
        </Button>
      </form>
    </div>
  );
}
