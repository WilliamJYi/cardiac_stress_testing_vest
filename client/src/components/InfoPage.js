import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { mockProfiles } from "../data/mockProfiles";

const Profile = ({info}) => {
  return (
    <div>
      <h1>User Information</h1>
      <p>Name: {info.name}</p>
      <p>Age: {info.age}</p>
      <p>Gender: {info.gender}</p>
      <h1>Diagnosis</h1>
      <p>{info.status}</p>
      <h1>BPM</h1>
      <p>68</p>
    </div>
  )
}

export const InfoPage = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState(mockProfiles.users[id]);
  return <div><Profile info={profile}/></div>;
};
