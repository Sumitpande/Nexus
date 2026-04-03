import { Link } from "react-router-dom";

import { ThemeToggle } from "@/components/ThemeToggle";

import { MessageCircle, ArrowLeft, Check } from "lucide-react";

import SignupForm from "@/components/auth/SignupForm";

const Signup = () => {
  const features = [
    "Unlimited messaging",
    "Create team channels",
    "Direct messages",
    "File sharing",
  ];

  return (
    <div className="min-h-screen bg-gradient-surface flex">
      {/* Left side - Visual */}
      <div className="hidden lg:flex flex-1 bg-sidebar items-center justify-center p-12">
        <div className="max-w-md text-sidebar-foreground">
          <div className="w-20 h-20 rounded-3xl bg-gradient-cta flex items-center justify-center mb-8 shadow-glow">
            <MessageCircle className="w-10 h-10" />
          </div>
          <h2 className="font-display text-3xl font-bold mb-4">
            Start chatting today
          </h2>
          <p className="text-sidebar-foreground/70 text-lg mb-8">
            Create your free account and connect with your team instantly.
          </p>
          <ul className="space-y-4">
            {features.map((feature, i) => (
              <li key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                  <Check className="w-4 h-4 text-primary" />
                </div>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex flex-col p-8">
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <ThemeToggle />
        </div>

        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-md animate-slide-up">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-gradient-cta flex items-center justify-center shadow-medium">
                <MessageCircle className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold">
                  Create account
                </h1>
                <p className="text-muted-foreground">
                  Get started with Chatter
                </p>
              </div>
            </div>

            <SignupForm />

            <p className="text-center text-muted-foreground mt-6">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-primary hover:underline font-medium"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
