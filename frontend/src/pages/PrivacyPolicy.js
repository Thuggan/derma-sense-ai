import React from "react";
import "../styles/PrivacyPolicy.css";

const PrivacyPolicy = () => {
  return (
    <div className="privacy-policy-container">
      <div className="privacy-policy-content">
        <h1>Privacy Policy</h1>
        <p className="content-updated">Last updated: October 2024</p>
        
        <section>
          <h2>Introduction</h2>
          <p>
            At DermaSense AI, we are committed to protecting your privacy. This policy outlines how we collect, use, and safeguard your personal information when you use our services. We value the trust you place in us and employ the highest standards for secure transactions and customer information privacy.
          </p>
        </section>
        
        <section>
          <h2>Data Collection</h2>
          <p>
            We collect information such as your name, email, and skin images to provide our diagnostic services. This data is stored securely and used exclusively for generating accurate predictions. We do not excessively harvest data beyond what is strictly necessary for the application's functionality.
          </p>
        </section>
        
        <section>
          <h2>Data Usage</h2>
          <p>
            Your data is used to improve our AI models and provide you with personalized, accurate diagnoses. We maintain strict internal controls and <strong>do not share or sell your data</strong> to any third parties, advertisers, or external organizations without your explicit consent.
          </p>
        </section>
        
        <section>
          <h2>Data Security</h2>
          <p>
            We use industry-standard encryption protocols and security measures to protect your data from unauthorized access, alteration, disclosure, or destruction. Regular security audits are conducted to ensure our infrastructure remains robust against emerging threats.
          </p>
        </section>
        
        <section>
          <h2>Your Rights</h2>
          <p>
            You have the right to access, modify, or delete your personal data at any time. Simply visit your profile settings or reach out to our support team, and we will promptly honor your request to remove your data from our systems.
          </p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
