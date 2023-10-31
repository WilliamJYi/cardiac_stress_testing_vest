import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Avatar } from "@mui/material";
import { lightBlue } from "@mui/material/colors";
import { mockProfiles } from "../../data/mockProfiles";
import "./Profiles.css";

export const Profiles = () => {
  const [profiles, setProfiles] = useState(mockProfiles);

  const DisplayProfiles = () => {
    return (
      <div>
        {profiles.users.map((user) => (
          <p>{user.name}</p>
        ))}
      </div>
    );
  };

  return (
    <div className="container">
      <h2>Select User Profile</h2>
      <div className="profiles">
        {profiles.users.map((user, key) => (
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
        ))}
      </div>
    </div>
  );
};
