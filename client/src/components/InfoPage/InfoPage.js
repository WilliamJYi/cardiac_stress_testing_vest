import React, { useState } from "react";
import { useParams } from "react-router-dom";
import CanvasJsReact from "@canvasjs/react-charts/";
import { mockProfiles } from "../../data/mockProfiles";
import { mockData } from "../../data/mockData";
import "./InfoPage.css";

const Profile = ({ info }) => {
  const { CanvasJSChart } = CanvasJsReact;

  const [data, setData] = useState(mockData);

  const color = "#EB0102";

  const renderData = () => {
    let arr = [];
    for (const key in data) {
      arr.push({ x: key, y: mockData[key] });
    }
    console.log(arr);
    return arr;
  };

  function calculateAge(birthDate) {
    var today = new Date();
    var birthDateObj = new Date(birthDate);
    var age = today.getFullYear() - birthDateObj.getFullYear();
    var m = today.getMonth() - birthDateObj.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDateObj.getDate())) {
      age--;
    }
    return age;
  }

  const options = {
    theme: "dark1",
    title: {
      text: "ECG Display",
      fontColor: color,
    },

    axisY: {
      gridColor: color,
      lineColor: color,
      tickThickness: 0,
    },
    axisX: {
      gridColor: color,
      lineColor: color,
      tickThickness: 0,
    },
    data: [
      {
        type: "spline",
        color: "blue",
        dataPoints: renderData(),
      },
    ],
  };

  const containerProps = {
    width: "1000px",
    height: "360px",
    margin: "25px 100px",
  };

  return (
    <div className="info-container">
      <div>
        <h1>User Information</h1>
        <p>Name: {info.name}</p>
        <p>Age: {calculateAge(info.dateOfBirth)}</p>
        <p>Gender: {info.gender}</p>
        <h1>Diagnosis</h1>
        <p>{info.status}</p>
        <h1>BPM</h1>
        <p>68</p>
      </div>
      <div>
        <CanvasJSChart containerProps={containerProps} options={options} />
      </div>
    </div>
  );
};

export const InfoPage = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState(mockProfiles.users[id]);
  return (
    <div>
      <Profile info={profile} />
    </div>
  );
};
