import { useState, useEffect } from "react";
import { Button } from "@mui/material";
import "./Home.css";

export default function Home() {
  const [user, setUser] = useState("");

  useEffect(() => {
    let username = localStorage.getItem("username");
    setUser(username);
  }, []);

  return (
    <div className="container">
      <h1 className="title">Cardiac Stress Testing Vest</h1>
      <Button
        variant="contained"
        sx={{ bgcolor: "#D0D0D0", color: "black" }}
        href={user ? `/user-page/${user}` : "/login"}
      >
        Click here to begin
      </Button>
    </div>
  );
}
