import React, { useState, useEffect } from "react";
import { onValue, ref, set, update } from "firebase/database";
import { db } from "../../firebaseConfig";
import "./Login.css";

const Login = () => {
  const [accounts, setAccounts] = useState({});
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Add a state variable for password error
  const [errorMessage, setErrorMessage] = useState("");

  // read accounts from firebase database
  useEffect(() => {
    onValue(ref(db, "/accounts"), (snapshot) => {
      const data = snapshot.val();
      setAccounts(data);
      console.log(data);
    });
  }, []);

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Perform login logic here
    if (username in accounts) {
      console.log("Username exists");
      if (accounts[username].password === password) {
        console.log("Password matches");
        localStorage.setItem("username", username);
        update(ref(db, `/accounts/${username}`), {
          loggedIn: true,
        }).then(() => {
          window.location.href = `/user-page/${username}`;
        });
      } else {
        console.log("Password does not match");
        setErrorMessage("Incorrect Username or Password.");
      }
    } else {
      console.log("Username does not exist");
      setErrorMessage("Incorrect Username or Password.");
    }

    console.log("Logging in...");
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2 className="login-title">Login</h2>
        <div>
          {errorMessage && <p className="error-message">{errorMessage}</p>}
        </div>
        <label>Username:</label>
        <input
          type="text"
          placeholder="Enter your username"
          value={username}
          onChange={handleUsernameChange}
        />
        <label>Password:</label>
        <input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={handlePasswordChange}
        />

        <button type="submit">Login</button>
        <p className="signup-link">
          Don't have an account? &nbsp; <a href="/create-account">Sign Up</a>
        </p>
      </form>
    </div>
  );
};

export default Login;
