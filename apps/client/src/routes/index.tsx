import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "@/pages/Login";
import Landing from "@/pages/Landing";
import Signup from "@/pages/Signup";
import Layout from "@/pages/Layout";
import Home from "@/pages/Home";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AuthBootstrap } from "@/components/auth/AuthBootstrap";
import { AuthRedirect } from "@/components/auth/AuthRedirect";
import { ChatProvider } from "@/components/chat/ChatProvider";
import { SocketProvider } from "@/socket/SocketProvider";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <AuthBootstrap>
        <SocketProvider>
          <ChatProvider>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route
                path="/login"
                element={
                  <AuthRedirect>
                    <Login />
                  </AuthRedirect>
                }
              />
              <Route
                path="/signup"
                element={
                  <AuthRedirect>
                    <Signup />
                  </AuthRedirect>
                }
              />
              <Route
                path="/home/:conversationId?"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Home />
                    </Layout>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </ChatProvider>
        </SocketProvider>
      </AuthBootstrap>
    </BrowserRouter>
  );
}
