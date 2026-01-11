import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "@/pages/Login";
import Landing from "@/pages/Landing";
import Signup from "@/pages/Signup";
import Layout from "@/pages/Layout";
import Home from "@/pages/Home";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AuthBootstrap } from "@/components/auth/AuthBootstrap";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <AuthBootstrap>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Layout>
                  <Home />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* <Route
          path="/"
          element={
            <PrivateRoute>
              <Chat />
            </PrivateRoute>
          }
        /> */}
        </Routes>
      </AuthBootstrap>
    </BrowserRouter>
  );
}
