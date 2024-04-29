// // import React, { useState, useEffect } from "react";
// // import { onValue, ref, set } from "firebase/database";
// // import { db } from "../../firebaseConfig";
// // import { Line } from "react-chartjs-2";
// // import "chart.js/auto";
// // import "./PatientInfoPage.css";

// // const PatientInfoPage = () => {
// //   let username = localStorage.getItem("username");
// //   let patientIndex = window.location.href.split("/").pop();
// //   const [patientInfo, setPatientInfo] = useState("");
// //   const [bpm, setBpm] = useState(0);
// //   const [rr_interval, setRr_interval] = useState(0);
// //   const [ecgData, setEcgData] = useState([]);

// //   useEffect(() => {
// //     onValue(
// //       ref(db, `/accounts/${username}/patients/${patientIndex}`),
// //       (snapshot) => {
// //         const data = snapshot.val();
// //         if (data) {
// //           setPatientInfo(data);
// //         }
// //       }
// //     );
// //   }, []);

// //   useEffect(() => {
// //     const fetchBpm = async () => {
// //       try {
// //         const res = await fetch("/bpm_data");
// //         const data = await res.json();
// //         setBpm(data.bpm_data);
// //         setRr_interval(data.rr_intervals);
// //       } catch (error) {
// //         console.error("Error fetching BPM data:", error);
// //       }
// //     };

// //     // Fetch BPM initially
// //     fetchBpm();

// //     // Set up interval to fetch BPM every 10 seconds
// //     const intervalId = setInterval(fetchBpm, 2000);

// //     // Cleanup function to clear the interval when component is unmounted
// //     return () => {
// //       clearInterval(intervalId);
// //     };
// //   }, []); // Empty dependency array to ensure the effect runs only once on mount

// //   useEffect(() => {
// //     const fetchEcgData = async () => {
// //       try {
// //         const res = await fetch("/ecg_data"); // Adjust the API endpoint based on your server setup
// //         const data = await res.json();
// //         setEcgData(data.ecg_data.values);
// //       } catch (error) {
// //         console.error("Error fetching ECG data:", error);
// //       }
// //     };

// //     // Set up interval to fetch ECG data every 3 seconds
// //     const intervalId = setInterval(fetchEcgData, 2000);

// //     // Cleanup function to clear the interval when the component is unmounted
// //     return () => {
// //       clearInterval(intervalId);
// //     };

// //     // const mockEcgData = Array.from({ length: 100 }, () =>
// //     //   Math.floor(Math.random() * 100)
// //     // );
// //     // setEcgData(mockEcgData);
// //     // console.log(mockEcgData);
// //   }, []);

// //   const renderChart = () => {
// //     if (ecgData.length === 0) return null;

// //     // Take only the first 100 elements of ecgData
// //     const slicedEcgData = ecgData.slice(0, 100);

// //     // const canvasId = `ecgCanvas-${Math.random()}`; // Generate a unique ID for each canvas

// //     return (
// //       <div className="ecg-section">
// //         {/* <h1>ECG Data</h1> */}
// //         <Line
// //           data={{
// //             labels: Array.from(
// //               { length: slicedEcgData.length },
// //               (_, i) => i + 1
// //             ),
// //             datasets: [
// //               {
// //                 label: "ECG",
// //                 data: slicedEcgData,
// //                 fill: false,
// //                 borderColor: "#e74c3c",
// //                 tension: 0.3,
// //               },
// //             ],
// //           }}
// //           options={{
// //             scales: {
// //               x: {
// //                 type: "linear",
// //                 position: "bottom",
// //               },
// //               y: {
// //                 min: -2,
// //                 max: 2,
// //               },
// //             },
// //           }}
// //         />
// //       </div>
// //     );
// //   };
import React, { useState, useEffect } from "react";
import { onValue, ref, set } from "firebase/database";
import { db } from "../../firebaseConfig";
import { Line } from "react-chartjs-2";
import "chart.js/auto";
import "./PatientInfoPage.css";

const MAX_POINTS = 400; // Maximum number of points to display

const PatientInfoPage = () => {
  let username = localStorage.getItem("username");
  let patientIndex = window.location.href.split("/").pop();
  const [patientInfo, setPatientInfo] = useState("");
  const [bpm, setBpm] = useState(0);
  const [rr_interval, setRr_interval] = useState(0);
  const [heartCondition, setHeartCondition] = useState("");
  const [ecgData, setEcgData] = useState([]);
  const [labels, setLabels] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [totalDataCount, setTotalDataCount] = useState(0);

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
  }, [username, patientIndex]);

  useEffect(() => {
    function calculateMean(array) {
      const sum = array.reduce((acc, curr) => acc + curr, 0);
      return sum / array.length;
    }

    const fetchBpm = async () => {
      try {
        const res = await fetch("/bpm_data");
        const data = await res.json();
        // randomly generate bpm values from 60 to 120
        const newBpm = Math.floor(Math.random() * (120 - 60 + 1) + 60);
        // setBpm(newBpm);
        setBpm(data.bpm_data);
        setRr_interval(calculateMean(data.rr_intervals));
      } catch (error) {
        console.error("Error fetching BPM data:", error);
      }
    };

    // Fetch BPM initially
    fetchBpm();
  }, [currentIndex]); // Empty dependency array to ensure the effect runs only once on mount

  useEffect(() => {
    const fetchEcgData = async () => {
      try {
        const res = await fetch("/ecg_data");
        const data = await res.json();
        console.log(data.ecg_data.values);
        const newData = data.ecg_data.values[currentIndex];
        console.log(currentIndex, newData);
        // remove current index of elements from the beginning of the newData array

        setTotalDataCount((prevCount) => prevCount + 1); // Increment total data count

        // setEcgData((prevData) => {
        //   // Append new data
        //   console.log(prevData, newData);
        //   const updatedData = [...prevData, newData];
        //   // Slice array to keep the last MAX_POINTS elements
        //   return updatedData.slice(
        //     Math.max(0, updatedData.length - MAX_POINTS)
        //   );
        // });

        // setLabels((prevLabels) => {
        //   // Use totalDataCount for generating new label
        //   const newLabel = totalDataCount + 1;
        //   const updatedLabels = [...prevLabels, newLabel];
        //   return updatedLabels.slice(
        //     Math.max(0, updatedLabels.length - MAX_POINTS)
        //   );
        // });

        setEcgData((prevData) => [...prevData, newData]);

        setLabels((prevLabels) => [...prevLabels, prevLabels.length + 1]);
      } catch (error) {
        console.error("Error fetching ECG data:", error);
      }
    };

    fetchEcgData();
  }, [currentIndex]);

  useEffect(() => {
    const incrementCurrentIndex = () => {
      setCurrentIndex((prevClock) => prevClock + 1);
    };

    // Change the interval to 1000 milliseconds for a 1-second update rate
    const intervalId = setInterval(incrementCurrentIndex, 300);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    const fetchHeartCondition = async () => {
      if (rr_interval && bpm) {
        try {
          const res = await fetch(
            `/heart_condition?age=${calculateAge(
              patientInfo.dateOfBirth
            )}&height=${patientInfo.height}&weight=${
              patientInfo.weight
            }&rr=${rr_interval}&bpm=${bpm}`
          );
          const data = await res.json();
          setHeartCondition(data.heart_condition);
          console.log(data.heart_condition);
        } catch (error) {
          console.error("Error fetching heart condition:", error);
        }
      }
    };

    const intervalId = setInterval(fetchHeartCondition, 1000); // Adjust interval as needed

    return () => {
      clearInterval(intervalId);
    };
  }, [rr_interval, bpm]);

  const renderChart = () => {
    if (ecgData.length === 0) return null;

    return (
      <div className="ecg-section">
        <Line
          data={{
            labels: labels,
            datasets: [
              {
                label: "ECG",
                data: ecgData,
                fill: false,
                borderColor: "#e74c3c",
                tension: 0.1, // Adjust for smoother or sharper curves
              },
            ],
          }}
          options={{
            animation: false, // Disable animation for smoother updates
            scales: {
              x: {
                type: "linear",
                position: "bottom",
                ticks: {
                  autoSkip: true,
                  maxTicksLimit: 20, // Adjust based on your preference
                },
              },
              y: {
                beginAtZero: false,
                suggestedMin: 1.9, // Adjust based on expected data range
                suggestedMax: 2,
              },
            },
            plugins: {
              legend: {
                display: false, // Set to true if you want to display the legend
              },
            },
          }}
        />
      </div>
    );
  };

  // Other component code (calculateAge, return statement) remains unchanged

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
    <div className="page-container">
      {patientInfo ? (
        <div className="cards-container">
          <div className="patient-card-container">
            <div className="card-info-container">
              <h1>Patient Information</h1>
              <div className="card-info">
                <p>First Name: {patientInfo.firstName}</p>
                <p>Last Name: {patientInfo.lastName}</p>
                <p>Age: {calculateAge(patientInfo.dateOfBirth)}</p>
                <p>Height: {patientInfo.height} cm</p>
                <p>Weight: {patientInfo.weight} lbs</p>
              </div>
            </div>
          </div>
          <div className="diagnosis-card-container">
            <div className="card-info-container">
              <h1>Diagnosis</h1>
              <div className="diagnosis-card-info">
                {renderChart() ? (
                  renderChart()
                ) : (
                  <div>
                    <h1>Loading...</h1> <br />
                  </div>
                )}

                <div className="bpm-section">
                  <span className="bpm-label">BPM:&nbsp;</span>
                  <span>{bpm ? bpm.toFixed(1) : "N/A"}</span>
                </div>
                <br />
                <div className="bpm-section">
                  <span className="bpm-label">R_R:&nbsp;</span>
                  <span>{rr_interval ? rr_interval.toFixed(2) : "N/A"}</span>
                </div>
                <br />
                <div className="bpm-section">
                  <span className="bpm-label">Heart Condition:&nbsp;</span>
                  <span>{heartCondition ? heartCondition : "N/A"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="loading-container">
          <h1>Loading...</h1>
        </div>
      )}
    </div>
  );
};

export default PatientInfoPage;
