import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import UserAuth from "../auth/UserAuth";
import { useUser } from "../context/user.context";

/* -------------------------------------------------------------------------- */
/* LAZY LOADED SCREENS */
/* -------------------------------------------------------------------------- */
const Login = lazy(() => import("../screen/Login"));
const Register = lazy(() => import("../screen/Register"));
const Home = lazy(() => import("../screen/Home"));
const Project = lazy(() => import("../screen/project"));
const NotFound = lazy(() => import("../screen/NotFound"));

/* -------------------------------------------------------------------------- */
/* GLOBAL LOADER */
/* -------------------------------------------------------------------------- */
const PageLoader = () => (
  <div className="h-screen flex items-center justify-center">
    <p className="text-lg animate-pulse">Loading...</p>
  </div>
);

/* -------------------------------------------------------------------------- */
/* PUBLIC ROUTE (BLOCK AUTH USERS) */
/* -------------------------------------------------------------------------- */
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useUser();
  return isAuthenticated ? <Navigate to="/" replace /> : children;
};

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>

          {/* 🔐 PROTECTED ROUTES */}
          <Route
            path="/"
            element={
              <UserAuth>
                <Home />
              </UserAuth>
            }
          />

          <Route
            path="/project"
            element={
              <UserAuth>
                <Project />
              </UserAuth>
            }
          />

          {/* 🔓 PUBLIC ROUTES */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />

          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />

          {/* 🚫 404 */}
          <Route path="*" element={<NotFound />} />

        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default AppRoutes;
