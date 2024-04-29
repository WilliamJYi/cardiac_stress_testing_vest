import React, { useState, useEffect } from "react";
import { uid } from "uid";
import { set, ref, onValue, update } from "firebase/database";
import { db } from "../../firebaseConfig";
import "../../firebaseConfig";
import "./CreateProfile.css";

const CreateProfile = () => {
  let username = localStorage.getItem("username");
  const [patientInfo, setPatientInfo] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    height: "", // Added input for height
    weight: "", // Added input for weight
    id: uid(),
  });
  const [patients, setPatients] = useState([]); // Added patients state
  const { firstName, lastName, dateOfBirth, height, weight } = patientInfo;

  useEffect(() => {
    onValue(ref(db, `/accounts/${username}/patients`), (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const patientList = Object.values(data);
        setPatients(patientList);
      }
    });
  }, []);

  const onChange = (e) =>
    setPatientInfo({ ...patientInfo, [e.target.name]: e.target.value });

  // post request to create profile in firebase database
  const onSubmit = (e) => {
    e.preventDefault();
    // Update the patients list in the database
    console.log("patients", patients);
    update(ref(db, `/accounts/${username}/patients`), {
      [patientInfo.id]: patientInfo,
    }).then(() => {
      window.location.href = `/user-page/${username}`;
    });
  };

  return (
    <div className="container">
      <form className="create-patient-form" onSubmit={(e) => onSubmit(e)}>
        <h2 className="create-patient-title">Patient Form</h2>
        <div>
          <label htmlFor="firstName">First Name</label>
          <input
            type="text"
            name="firstName"
            value={firstName}
            placeholder="Enter first name"
            onChange={(e) => onChange(e)}
            required
          />
        </div>
        <div>
          <label htmlFor="lastName">Last Name</label>
          <input
            type="text"
            name="lastName"
            value={lastName}
            placeholder="Enter last name"
            onChange={(e) => onChange(e)}
            required
          />
        </div>
        <div>
          <label htmlFor="dateOfBirth">Date of Birth</label>
          <input
            type="date"
            name="dateOfBirth"
            value={dateOfBirth}
            onChange={(e) => onChange(e)}
            required
          />
        </div>
        <div>
          <label htmlFor="height">Height (cm)</label>
          <input
            type="text"
            name="height"
            value={height}
            placeholder="Enter height"
            onChange={(e) => onChange(e)}
            required
          />
        </div>
        <div>
          <label htmlFor="weight">Weight (lbs)</label>
          <input
            type="text"
            name="weight"
            value={weight}
            placeholder="Enter weight"
            onChange={(e) => onChange(e)}
            required
          />
        </div>
        <input type="submit" value="Create Profile" />
      </form>
    </div>
  );
};

export default CreateProfile;
