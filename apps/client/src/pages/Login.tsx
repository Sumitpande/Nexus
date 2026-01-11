import { Link } from "react-router-dom";

import { ThemeToggle } from "@/components/ThemeToggle";

import { MessageCircle, ArrowLeft } from "lucide-react";
import { LoginForm } from "@/components/auth/LoginForm";

const Login = () => {
  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   if (!email || !password) {
  //     toast.error("Error", {
  //       description: "Please fill in all fields",
  //     });
  //     return;
  //   }
  //   setIsLoading(true);
  //   try {
  //     //   await login(email, password);
  //     toast.success("Welcome back!", {
  //       description: "Successfully logged in",
  //     });
  //     navigate("/chat");
  //   } catch (error) {
  //     toast.error("Error", {
  //       description: "Failed to login: " + error,
  //     });
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  return (
    <div className="min-h-screen bg-gradient-surface flex">
      {/* Left side - Form */}
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
                  Welcome back
                </h1>
                <p className="text-muted-foreground">
                  Sign in to your workspace
                </p>
              </div>
            </div>
            <LoginForm />
            <p className="text-center text-muted-foreground mt-6">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="text-primary hover:underline font-medium"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Visual */}
      <div className="hidden lg:flex flex-1 bg-sidebar items-center justify-center p-12">
        <div className="max-w-md text-center text-sidebar-foreground">
          <div className="w-20 h-20 rounded-3xl bg-gradient-cta flex items-center justify-center mx-auto mb-8 shadow-glow">
            <MessageCircle className="w-10 h-10" />
          </div>
          <h2 className="font-display text-3xl font-bold mb-4">
            Stay connected
          </h2>
          <p className="text-sidebar-foreground/70 text-lg">
            Join your team and start collaborating in real-time with channels,
            direct messages, and more.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
