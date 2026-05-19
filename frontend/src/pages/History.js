import React, { useEffect, useState } from "react";
import "../styles/History.css";
import historyImage from "../assets/history.png";  
import { deleteHistoryEntry, getHistory } from "../api";

const History = () => {
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await getHistory(50);
        setHistoryData(response.history || response || []);
      } catch (err) {
        setError(err.message || "Failed to load diagnosis history");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const formatDate = (dateValue) => {
    if (!dateValue) return "";
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).format(new Date(dateValue));
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this diagnosis history entry?")) return;

    try {
      await deleteHistoryEntry(id);
      setHistoryData(prev => prev.filter(entry => entry._id !== id));
    } catch (err) {
      setError(err.message || "Failed to delete history entry");
    }
  };

  return (
    <div className="history-container">
      <h1>
        <img src={historyImage} alt="History Icon" className="history-image" /> Diagnosis History
      </h1>

      {loading && <p className="history-state">Loading diagnosis history...</p>}
      {error && <p className="history-error">{error}</p>}

      {!loading && !error && historyData.length === 0 && (
        <div className="history-empty">
          <p>No diagnosis history yet.</p>
          <p>Run a Quick Check and your completed assessment will appear here.</p>
        </div>
      )}

      {!loading && historyData.length > 0 && (
        <table className="history-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Condition</th>
              <th>Confidence</th>
              <th>Image</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {historyData.map((entry) => (
              <tr key={entry._id}>
                <td>{formatDate(entry.date || entry.createdAt)}</td>
                <td>{entry.diagnosis?.condition || entry.topResult?.disease || "Unknown"}</td>
                <td>{Math.round(entry.diagnosis?.confidence || entry.topResult?.confidence || 0)}%</td>
                <td>{entry.imageInfo?.name || "Uploaded image"}</td>
                <td>
                  <button className="history-delete-btn" onClick={() => handleDelete(entry._id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default History;

