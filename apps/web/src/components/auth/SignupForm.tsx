import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { signup } from "@/api/auth.api";

export default function SignupForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error("Error", {
        description: "Please fill in all fields",
      });
      return;
    }
    if (password.length < 6) {
      toast.error("Error", {
        description: "Password must be at least 6 characters",
      });
      return;
    }
    setIsLoading(true);
    try {
      await signup(email, password, name);
      toast.success("Welcome!", {
        description: "Account created successfully",
      });
      navigate("/home");
    } catch (error) {
      toast.error("Error", {
        description: "Failed to create account: " + error,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="name">Full name</Label>
        <Input
          id="name"
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-12"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-12"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Min. 6 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="h-12"
        />
      </div>

      <Button
        type="submit"
        variant="hero"
        size="lg"
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          "Create account"
        )}
      </Button>
    </form>
  );
}
