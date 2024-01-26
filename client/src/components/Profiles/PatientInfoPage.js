import React, { useState, useEffect } from "react";
import { onValue, ref } from "firebase/database";
import { db } from "../../firebaseConfig";

const PatientInfoPage = () => {
  let username = localStorage.getItem("username");
  let patientIndex = window.location.href.split("/").pop();
  const [patientInfo, setPatientInfo] = useState("");

  useEffect(() => {
    onValue(
      ref(db, `/accounts/${username}/patients/${patientIndex}`),
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setPatientInfo(data);
        }
      }
    );
  }, []);

  const calculateAge = (birthDate) => {
    var today = new Date();
    var birthDateObj = new Date(birthDate);
    var age = today.getFullYear() - birthDateObj.getFullYear();
    var m = today.getMonth() - birthDateObj.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDateObj.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div>
      {patientInfo ? (
        <div>
          <h1>Patient Information</h1>
          <p>First Name: {patientInfo.firstName}</p>
          <p>Last Name: {patientInfo.lastName}</p>
          <p>Age: {calculateAge(patientInfo.dateOfBirth)}</p>
          <p>Height: {patientInfo.height} cm</p>
          <p>Weight: {patientInfo.weight} lbs</p>
          <p>Diagnosis:</p>
        </div>
      ) : (
        <div>
          <h1>Loading...</h1>
        </div>
      )}
    </div>
  );
};

export default PatientInfoPage;
