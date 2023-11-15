import React from "react";
import { Button } from "@mui/material";
import "./Home.css";

export default function Home() {
  return (
    <div className="container">
      <h1 className="title">Cardiac Stress Testing Vest</h1>
      <Button
        variant="contained"
        sx={{ bgcolor: "#D0D0D0", color: "black" }}
        href="/profiles"
      >
        Click here to begin
      </Button>
    </div>
  );
}
