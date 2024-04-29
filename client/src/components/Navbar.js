import React, { useEffect } from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import { Button } from "@mui/material";

export default function Navbar() {
  const [isUserLoggedIn, setIsUserLoggedIn] = React.useState(false);
  let username = localStorage.getItem("username");

  useEffect(() => {
    username ? setIsUserLoggedIn(true) : setIsUserLoggedIn(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("username");
  };

  return (
    <AppBar position="fixed" sx={{ bgcolor: "black" }}>
      <Toolbar>
        <Button color="inherit" sx={{ marginLeft: "auto" }} href="/">
          Home
        </Button>
        {isUserLoggedIn ? (
          <div>
            <Button
              color="inherit"
              href={`/user-page/${localStorage.getItem("username")}`}
            >
              {username}
            </Button>
            <Button color="inherit" onClick={handleLogout} href="/">
              Logout
            </Button>
          </div>
        ) : (
          <Button color="inherit" href="/login">
            Login
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
}
