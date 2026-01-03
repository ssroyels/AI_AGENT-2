import { Navigate, useLocation } from "react-router-dom";
import { useUser } from "../context/user.context";

const UserAuth = ({ children }) => {
  const { loading, isAuthenticated } = useUser();
  const location = useLocation();

  /* -------------------------------------------------------------------------- */
  /* WAIT UNTIL AUTH STATE IS READY */
  /* -------------------------------------------------------------------------- */
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-lg animate-pulse">Checking authentication...</p>
      </div>
    );
  }

  /* -------------------------------------------------------------------------- */
  /* NOT LOGGED IN → REDIRECT */
  /* -------------------------------------------------------------------------- */
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  /* -------------------------------------------------------------------------- */
  /* AUTHENTICATED → ALLOW ACCESS */
  /* -------------------------------------------------------------------------- */
  return <>{children}</>;
};

export default UserAuth;
