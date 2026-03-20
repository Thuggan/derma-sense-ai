import React, { useState, useEffect } from "react";
import "../styles/FAQ.css";
import faqIcon from "../assets/faq-icon.png";

const FAQ = () => {
  const [faqs, setFaqs] = useState([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Default fallback if db is empty
  const defaultFaqs = [
    {
      _id: 'default1',
      question: "How accurate is DermaSense AI?",
      answer: "DermaSense AI uses advanced AI technology with an accuracy rate of over 90% for common skin conditions.",
    },
    {
      _id: 'default2',
      question: "Is my data secure?",
      answer: "Yes, we use industry-standard encryption to protect your data.",
    },
    {
      _id: 'default3',
      question: "Can I use DermaSense AI for children?",
      answer: "Yes, DermaSense AI is safe for all ages.",
    }
  ];

  useEffect(() => {
    // Check if user is admin
    const userString = localStorage.getItem('user');
    if (userString) {
      try {
        const user = JSON.parse(userString);
        if (user && user.isAdmin) {
          setIsAdmin(true);
        }
      } catch (e) {
        console.error("Error parsing user from local storage");
      }
    }
    fetchFaqs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchFaqs = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/faqs");
      const data = await response.json();
      if (data.success && data.data.length > 0) {
        setFaqs(data.data);
      } else {
        setFaqs(defaultFaqs);
      }
    } catch (error) {
      console.error("Error fetching FAQs:", error);
      setFaqs(defaultFaqs);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFaq = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch("http://localhost:5000/api/faqs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ question: newQuestion, answer: newAnswer })
      });
      const data = await response.json();
      if (data.success) {
        setNewQuestion("");
        setNewAnswer("");
        alert("FAQ added successfully");
        fetchFaqs(); 
      } else {
        alert("Failed to add FAQ: " + data.message);
      }
    } catch (error) {
      console.error("Error adding FAQ:", error);
      alert("Error adding FAQ");
    }
  };

  const handleDeleteFaq = async (id) => {
    if (id.startsWith('default')) {
      alert("This is a default FAQ. Add dynamic FAQs to replace them, or connect to the database to manage DB FAQs.");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this FAQ?")) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/faqs/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        fetchFaqs(); 
      } else {
        alert("Failed to delete FAQ: " + data.message);
      }
    } catch (error) {
      console.error("Error deleting FAQ:", error);
      alert("Error deleting FAQ");
    }
  };

  if (loading) return <div>Loading FAQs...</div>;

  return (
    <div className="faq-container">
      <h1>Frequently Asked Questions</h1>
      
      {isAdmin && (
        <div className="admin-faq-form" style={{ marginBottom: "30px", padding: "20px", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "8px", background: "rgba(0,0,0,0.1)" }}>
          <h2>Admin: Add New FAQ</h2>
          <form onSubmit={handleAddFaq}>
            <div style={{ marginBottom: "10px" }}>
              <input 
                type="text" 
                placeholder="Question" 
                value={newQuestion} 
                onChange={(e) => setNewQuestion(e.target.value)} 
                required 
                style={{ width: "100%", padding: "10px", borderRadius: "5px", border: "1px solid #ccc", background: "#f9f9f9", color: "#333" }}
              />
            </div>
            <div style={{ marginBottom: "15px" }}>
              <textarea 
                placeholder="Answer" 
                value={newAnswer} 
                onChange={(e) => setNewAnswer(e.target.value)} 
                required 
                rows="3" 
                style={{ width: "100%", padding: "10px", borderRadius: "5px", border: "1px solid #ccc", background: "#f9f9f9", color: "#333" }}
              />
            </div>
            <button type="submit" style={{ padding: "10px 20px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}>
              Publish FAQ
            </button>
          </form>
        </div>
      )}

      <div className="faq-list">
        {faqs.map((faq) => (
          <div key={faq._id} className="faq-item" style={{ position: "relative" }}>
            <div className="faq-text">
              <h3>{faq.question}</h3>
              <p>{faq.answer}</p>
            </div>
            <div className="faq-icon" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
              <img src={faqIcon} alt="FAQ Icon" />
              {isAdmin && (
                <button 
                  onClick={() => handleDeleteFaq(faq._id)}
                  style={{ backgroundColor: "#dc3545", color: "white", border: "none", padding: "5px 10px", borderRadius: "4px", fontSize: "12px", cursor: "pointer" }}
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQ;
