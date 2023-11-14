import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CssBaseline } from "@mui/material";
import Navbar from "./components/Navbar";
import Home from "./components/Home/Home";
import { Profiles } from "./components/Profiles/Profiles";
import { Layout } from "./components/Layout/Layout";
import { InfoPage } from "./components/InfoPage";
import CreateProfile from "./components/Profiles/CreateProfile";

function App() {
  return (
    <CssBaseline>
      <Navbar />
      <Layout>
        <BrowserRouter>
          <Routes>
            <Route path="/" Component={Home} />
            <Route path="/profiles" Component={Profiles} />
            <Route path="/profiles/:id" Component={InfoPage} />
            <Route path="/profiles/create-profile" Component={CreateProfile} />
          </Routes>
        </BrowserRouter>
      </Layout>
    </CssBaseline>
  );
}

export default App;
