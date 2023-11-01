import React, { useState, useEffect } from "react";
import "./Home.css";
import { Button} from "@mui/material";

export default function Home() {
  const [data, setData] = useState([{}]);

  // useEffect(() => {
  //   fetch("/firebase")
  //     .then((res) => res.json())
  //     .then((data) => {
  //       setData(data);
  //     });
  // }, []);

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
      {/* {console.log(data)}
      {typeof data.name === "undefined" ? (
        <p>Loading...</p>
      ) : (
        <p>{data.name}</p>
      )} */}
      {/* {typeof data.members === "undefined" ? (
        <p>Loading...</p>
      ) : (
        data.members.map((member, i) => <p key={i}>{member}</p>)
      )} */}
    </div>
  );
}
