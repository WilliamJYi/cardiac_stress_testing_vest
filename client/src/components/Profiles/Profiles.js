import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Avatar } from "@mui/material";
import { lightBlue } from "@mui/material/colors";
import "./Profiles.css";

export const Profiles = () => {
  const [profiles, setProfiles] = useState({});

  useEffect(() => {
    fetch("/profiles")
      .then((res) => res.json())
      .then((data) => {
        setProfiles(data);
        console.log(data);
      });
  }, []);

  return (
    <div className="container">
      <h2>Select User Profile</h2>
      <div className="profiles">
        {typeof profiles.users === "undefined" ? (
          <p>Loading...</p>
        ) : (
          profiles.users.map((user, key) => (
            <Link key={key} to={`/profiles/${user.id}`} className="link">
              <Avatar
                sx={{
                  bgcolor: lightBlue[500],
                  width: 100,
                  height: 100,
                  margin: 5,
                  "&:hover": { background: "blue" },
                }}
              >
                {user.name}
              </Avatar>
            </Link>
          ))
        )}
        <Link to={"/profiles/create-profile"}>
          <button className="add-profile">+</button>
        </Link>
      </div>
    </div>
  );
};
