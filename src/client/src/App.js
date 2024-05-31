import React, { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [cardNumber, setCardNumber] = useState("");
  const [start, setStart] = useState(0);
  const [limit, setLimit] = useState(10);
  const [result, setResult] = useState("");
  const [error, setError] = useState(null);
  const [statsResult, setStatsResult] = useState("");
  const [statsError, setStatsError] = useState(null);
  const [endpoint, setEndpoint] = useState(null);

  const handleSubmit = () => {
    setEndpoint(`/api/card-scheme/verify/${cardNumber}`);
  };

  const handleGetStats = () => {
    setEndpoint(`/api/card-scheme/stats/${start}/${limit}`);
  };

  useEffect(() => {
    if (endpoint) {
      fetch(endpoint)
        .then((response) => response.json())
        .then((data) => {
          if (endpoint.includes("verify")) {
            setResult(data);
            setError(null);
          } else {
            setStatsResult(data);
            setStatsError(null);
          }
        })
        .catch((error) => {
          if (endpoint.includes("verify")) {
            setResult(null);
            setError("Failed to lookup card number");
          } else {
            setStatsResult(null);
            setStatsError("Failed to get statistics");
          }
          console.error("Oops! There was an error!", error);
        })
        .finally(() => setEndpoint(null));
    }
  }, [endpoint]);

  return (
    <div className="app">
      <div className="section">
        <h3>Card Lookup</h3>
        <input
          type="text"
          value={cardNumber}
          placeholder="Enter card number"
          onChange={(e) => setCardNumber(e.target.value)}
        />
        <button onClick={handleSubmit} className="button">
          Verify
        </button>
      </div>
      <div className="section">
        <h3>Card Results</h3>
        {(result || error) && (
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
              {JSON.stringify(result, null, 2) || error}
            </pre>
          </div>
        )}
      </div>
      <div className="section">
        <h3>
          Get statistics by setting the offset(start) and how many
          records(limit)
        </h3>
        <input
          type="text"
          value={start}
          onChange={(e) => setStart(e.target.value)}
          placeholder="Enter start"
        />
        <input
          type="text"
          value={limit}
          onChange={(e) => setLimit(e.target.value)}
          placeholder="Enter limit"
        />
        <button onClick={handleGetStats} className="button">
          Get Stats
        </button>
      </div>
      <div className="section">
        <h3>Statistics Results</h3>
        {(statsResult || statsError) && (
          <div className="result">
            <h5>Stats Raw Response:</h5>
            <pre>{JSON.stringify(statsResult, null, 2) || statsError}</pre>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
