import React from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import { Button } from "@mui/material";

export default function Navbar() {
  return (
    <AppBar position="fixed" sx={{ bgcolor: "black" }}>
      <Toolbar>
        <Button
          color="inherit"
          sx={{ marginLeft: "auto", marginRight: "auto" }}
          href="/"
        >
          Home
        </Button>
      </Toolbar>
    </AppBar>
  );
}
