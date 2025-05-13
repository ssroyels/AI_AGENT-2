import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./screen/Home";
import Signup from "./screen/Signup";
import Login from "./screen/Login";
import { UserProvider } from "./context/user.context";
import Project from "./screen/project";
import UserAuth from "./auth/user.auth";


const App = () => {
  return (
    <>
      <UserProvider>
       <BrowserRouter>
       <Routes>
          <Route path="/" element={<UserAuth><Home /></UserAuth>} />
          <Route path="/register" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/project" element= {<UserAuth><Project/></UserAuth>} />
        </Routes>
       </BrowserRouter>
      </UserProvider>
    </>
  );
};

export default App;
