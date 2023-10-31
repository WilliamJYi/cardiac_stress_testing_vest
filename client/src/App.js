import React from "react";
import Home from "./components/Home/Home";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CssBaseline } from "@mui/material";
import Navbar from "./components/Navbar";
import { Profiles } from "./components/Profiles/Profiles";
import { Layout } from "./components/Layout/Layout";
import { InfoPage } from "./components/InfoPage";

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
          </Routes>
        </BrowserRouter>
      </Layout>
    </CssBaseline>
  );
}

export default App;
