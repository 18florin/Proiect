import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axios from "axios";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const { toast } = useToast();

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const { data } = await axios.post("/api/auth/forgot-password", { email });
      toast({ title: data.message });
    } catch (err) {
      toast({
        title: err.response?.data?.message || "Error",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="mx-auto max-w-md p-6 space-y-4">
      <h1 className="text-2xl font-bold">Forgot Password</h1>
      <form onSubmit={handleSubmit} className="grid gap-4">
        <Input
          type="email"
          required
          placeholder="Your registered email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Button type="submit" className="w-full">
          Send reset link
        </Button>
      </form>
    </div>
  );
}
