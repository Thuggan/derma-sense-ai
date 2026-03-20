import React, { useState } from "react";
import "../styles/Contact.css";


const Contact = () => {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState({ success: false, error: null, sending: false });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ success: false, error: null, sending: true });

    try {
      const response = await fetch("http://localhost:5000/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus({ success: true, error: null, sending: false });
        setFormData({ name: "", email: "", message: "" }); // Reset form
      } else {
        setStatus({ success: false, error: data.error || "Failed to send message.", sending: false });
      }
    } catch (err) {
      console.error(err);
      setStatus({ success: false, error: "Error connecting to the server.", sending: false });
    }
  };

  return (
    <div className="contact-container">
      <section className="contact-hero">
        <h1>Contact Us</h1>
        <p>We're here to help! Reach out to us for any questions or concerns.</p>
      </section>

      <section className="contact-content">
        <div className="contact-info">
          <h2>Get In Touch</h2>
          <p>Email: <a href="mailto:support@dermasense.ai">support@dermasense.ai</a></p>
          <p>Phone: +94 123 456 789</p>
          <p>Address: DermaSense AI, Kerala</p>
        </div>
        <div className="contact-form">
          <h2>Send Us a Message</h2>
          {status.success && <p className="success-message" style={{ color: "green", marginBottom: "10px" }}>Your message was sent successfully!</p>}
          {status.error && <p className="error-message" style={{ color: "red", marginBottom: "10px" }}>{status.error}</p>}
          <form onSubmit={handleSubmit}>
            <input type="text" name="name" placeholder="Your Name" value={formData.name} onChange={handleChange} required />
            <input type="email" name="email" placeholder="Your Email" value={formData.email} onChange={handleChange} required />
            <textarea name="message" placeholder="Your Message" rows="5" value={formData.message} onChange={handleChange} required></textarea>
            <button type="submit" disabled={status.sending}>{status.sending ? "Sending..." : "Send Message"}</button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default Contact;