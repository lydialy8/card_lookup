import React, { useEffect, useState } from "react";
import "./App.css"; // Import the CSS file for styling

function App() {
  // State variables
  const [cardNumber, setCardNumber] = useState(""); // Store card number input
  const [start, setStart] = useState(0); // Store start offset for stats
  const [limit, setLimit] = useState(10); // Store limit for stats
  const [data, setData] = useState({
    result: null,
    error: null,
    statsResult: null,
    statsError: null,
  }); // Store API responses and errors
  const [endpoint, setEndpoint] = useState(null); // Store current API endpoint

  // Handler for card verification form submission
  const handleSubmit = () => {
    setEndpoint(`/api/card-scheme/verify/${cardNumber}`); // Set endpoint for card verification
  };

  // Handler for fetching card stats
  const handleGetStats = () => {
    setEndpoint(`/api/card-scheme/stats/${start}/${limit}`); // Set endpoint for fetching stats
  };

  // useEffect hook to handle API requests
  useEffect(() => {
    if (endpoint) {
      fetch(endpoint)
        .then((response) => response.json()) // Parse the response as JSON
        .then((data) => {
          if (endpoint.includes("verify")) {
            // Check if the endpoint is for card verification
            setData((prevData) => ({ ...prevData, result: data, error: null })); // Update result state
          } else {
            // Endpoint is for stats
            setData((prevData) => ({
              ...prevData,
              statsResult: data,
              statsError: null,
            })); // Update stats result state
          }
        })
        .catch((error) => {
          if (endpoint.includes("verify")) {
            // Handle error for card verification
            setData((prevData) => ({
              ...prevData,
              result: null,
              error: "Failed to lookup card number",
            }));
          } else {
            // Handle error for stats
            setData((prevData) => ({
              ...prevData,
              statsResult: null,
              statsError: "Failed to get statistics",
            }));
          }
          console.error("Oops! There was an error!", error); // Log error
        })
        .finally(() => setEndpoint(null)); // Reset endpoint state
    }
  }, [endpoint]); // Dependency array for useEffect

  // Render the component
  return (
    <div className="app">
      {/* Card Lookup Section */}
      <div className="section">
        <h3>Card Lookup</h3>
        <input
          type="text"
          value={cardNumber}
          placeholder="Enter card number"
          onChange={(e) => setCardNumber(e.target.value)} // Update cardNumber state on input change
        />
        <button onClick={handleSubmit} className="button">
          Verify
        </button>
      </div>

      {/* Card Results Section */}
      <div className="section">
        <h3>Card Results</h3>
        {(data.result || data.error) && (
          <div style={{ marginTop: "20px" }}>
            <h5>Raw Response:</h5>
            <pre
              style={{
                background: "#333",
                color: "#ffffff",
                padding: "10px",
                borderRadius: "5px",
              }}
            >
              {JSON.stringify(data.result, null, 2) || data.error}
            </pre>
          </div>
        )}
      </div>

      {/* Stats Section */}
      <div className="section">
        <h3>
          Get statistics by setting the offset(start) and how many
          records(limit)
        </h3>
        <input
          type="text"
          value={start}
          onChange={(e) => setStart(e.target.value)} // Update start state on input change
          placeholder="Enter start"
        />
        <input
          type="text"
          value={limit}
          onChange={(e) => setLimit(e.target.value)} // Update limit state on input change
          placeholder="Enter limit"
        />
        <button onClick={handleGetStats} className="button">
          Get Stats
        </button>
      </div>

      {/* Stats Results Section */}
      <div className="section">
        <h3>Statistics Results</h3>
        {(data.statsResult || data.statsError) && (
          <div className="result">
            <h5>Stats Raw Response:</h5>
            <pre>
              {JSON.stringify(data.statsResult, null, 2) || data.statsError}
            </pre>{" "}
          </div>
        )}
      </div>
    </div>
  );
}

export default App; // Export the App component
