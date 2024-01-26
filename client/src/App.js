import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CssBaseline } from "@mui/material";
import Navbar from "./components/Navbar";
import Home from "./components/Home/Home";
import { Profiles } from "./components/Profiles/Profiles";
import { Layout } from "./components/Layout/Layout";
import { InfoPage } from "./components/InfoPage/InfoPage";
import CreateProfile from "./components/Profiles/CreateProfile";
import CreateAccount from "./components/Auth/CreateAccount";
import Login from "./components/Auth/Login";
import UserPage from "./components/UserPage/UserPage";
import PatientInfoPage from "./components/Profiles/PatientInfoPage";

function App() {
  return (
    <CssBaseline>
      <Navbar />
      <Layout>
        <BrowserRouter>
          <Routes>
            <Route path="/" Component={Home} />
            <Route path="/login" Component={Login} />
            <Route path="/create-account" Component={CreateAccount} />
            <Route path="/user-page/:id" Component={UserPage} />
            <Route path="/profiles" Component={Profiles} />
            <Route path="/profiles/:id" Component={InfoPage} />
            <Route
              path="/user-page/:id/create-profile"
              Component={CreateProfile}
            />
            <Route
              path="/user-page/:id/patient-info/:id"
              Component={PatientInfoPage}
            />
          </Routes>
        </BrowserRouter>
      </Layout>
    </CssBaseline>
  );
}

export default App;
