import React, { useState } from "react";
import { update, ref } from "firebase/database";
import { db } from "../../firebaseConfig";
import "./CreateAccount.css";

const CreateAccount = () => {
  const [accountData, setAccountData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    password: "",
  });

  const { firstName, lastName, username, password } = accountData;

  const handleChange = (e) => {
    setAccountData({ ...accountData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Perform account creation logic here
    console.log(accountData);
    // update array without overwriting previous data'
    update(ref(db, `/accounts/${accountData.username}`), accountData).then(
      () => {
        window.location.href = "/login";
      }
    );
  };

  return (
    <div className="create-account-container">
      <form className="create-account-form" onSubmit={handleSubmit}>
        <h2 className="create-account-title">Create an account</h2>
        <label>First Name:</label>
        <input
          type="text"
          name="firstName"
          placeholder="Enter your first name"
          value={firstName}
          onChange={handleChange}
        />
        <label>Last Name:</label>
        <input
          type="text"
          name="lastName"
          placeholder="Enter your last name"
          value={lastName}
          onChange={handleChange}
        />
        <label>Username:</label>
        <input
          type="text"
          name="username"
          placeholder="Enter your username"
          value={username}
          onChange={handleChange}
        />
        <label>Password:</label>
        <input
          type="password"
          name="password"
          placeholder="Enter your password"
          value={password}
          onChange={handleChange}
        />
        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
};

export default CreateAccount;
