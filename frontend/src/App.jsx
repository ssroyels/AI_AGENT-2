import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { UserProvider } from "./context/user.context";
import UserAuth from "./auth/user.auth";

/* -------------------------------------------------------------------------- */
/* LAZY LOADED SCREENS */
/* -------------------------------------------------------------------------- */
const Home = lazy(() => import("./screen/Home"));
const Signup = lazy(() => import("./screen/Signup"));
const Login = lazy(() => import("./screen/Login"));
const Project = lazy(() => import("./screen/project"));
const NotFound = lazy(() => import("./screen/NotFound"));

/* -------------------------------------------------------------------------- */
/* GLOBAL LOADER */
/* -------------------------------------------------------------------------- */
const PageLoader = () => (
  <div className="h-screen flex items-center justify-center bg-gray-100">
    <div className="text-lg font-semibold animate-pulse">
      Loading...
    </div>
  </div>
);

const App = () => {
  return (
    <UserProvider>
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
            <Route path="/register" element={<Signup />} />
            <Route path="/login" element={<Login />} />

            {/* 🚫 404 */}
            <Route path="*" element={<NotFound />} />

          </Routes>
        </Suspense>
      </BrowserRouter>
    </UserProvider>
  );
};

export default App;
