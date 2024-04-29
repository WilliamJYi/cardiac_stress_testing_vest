import React, { useState, useEffect } from "react";
import { onValue, ref, remove } from "firebase/database";
import { db } from "../../firebaseConfig";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./UserPage.css";

const UserPage = () => {
  const [user, setUser] = useState("");
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    let username = localStorage.getItem("username");
    onValue(ref(db, `/accounts/${username}`), (snapshot) => {
      const data = snapshot.val();
      setUser(data);
      console.log(data);
    });
    onValue(ref(db, `/accounts/${username}/patients`), (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const patientList = Object.values(data);
        setPatients(patientList);
      }
      console.log(data);
    });
  }, []);

  const deletePatient = (patientId) => {
    console.log(patientId);
    remove(ref(db, `/accounts/${user.username}/patients/${patientId}`));
    // You may want to update the state after deletion to reflect changes
    setPatients((prevPatients) =>
      prevPatients.filter((patient) => patient.id !== patientId)
    );
  };

  return (
    <div className="user-page-container">
      {user ? (
        <div className="user-page-content">
          <h1>
            {user.firstName} {user.lastName}
          </h1>
          <p>This is the user page content.</p>
          <h2>Your Patients:</h2>
          <ul className="patient-list">
            {patients.map((patient, index) => (
              <div key={index} className="patient">
                <a
                  className="patient-name"
                  key={index}
                  href={`/user-page/${user.username}/patient-info/${patient.id}`}
                >
                  {patient.firstName} {patient.lastName}
                </a>
                <div
                  className="delete"
                  onClick={() => deletePatient(patient.id)}
                >
                  Delete
                </div>
              </div>
            ))}
          </ul>
          <a
            className="add-patient"
            href={`/user-page/${user.username}/create-profile`}
          >
            Add Patient
          </a>
        </div>
      ) : (
        <div>
          <h1>Loading...</h1>
        </div>
      )}
    </div>
  );
};

export default UserPage;
