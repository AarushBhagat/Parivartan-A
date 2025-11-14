import React, { useState } from 'react';
import './FAQPage.css';

const FAQPage = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const faqs = [
    {
      question: "How do I register on the portal?",
      answer: "To register on the Department Dashboard portal, click on the 'Login' button, select your user type (Citizen, Admin, Staff, or Department), and follow the registration process. You'll need to provide valid identification and contact information."
    },
    {
      question: "What services are available through this portal?",
      answer: "The portal provides access to 18 different government departments including Municipal Corporation, Health Department, Education Department, Revenue Department, Police Department, Public Works Department, Transport Department, Agriculture Department, and more. You can submit grievances, track applications, and access various government services."
    },
    {
      question: "How can I track my grievance status?",
      answer: "Once you submit a grievance, you'll receive a unique grievance ID. You can use this ID to track the status of your grievance through the 'View Status' section. The system provides real-time updates on the progress of your application."
    },
    {
      question: "What are the office hours for support?",
      answer: "Our support team is available Monday to Friday, 9:00 AM to 5:00 PM. For emergency services, we have 24/7 helpline available at 1800-XXX-XXXX. You can also email us at support@kapurthala.gov.in."
    },
    {
      question: "Is the portal available in Hindi?",
      answer: "Yes, the portal is available in both English and Hindi. You can switch between languages using the language selector dropdown at the top of the page."
    },
    {
      question: "How secure is my personal information?",
      answer: "We take data security very seriously. The portal uses advanced encryption and security measures to protect your personal information. All data is stored securely and accessed only by authorized personnel for processing your requests."
    },
    {
      question: "Can I submit multiple grievances?",
      answer: "Yes, you can submit multiple grievances for different departments or issues. Each grievance will have its own unique ID for tracking purposes."
    },
    {
      question: "What documents do I need to submit a grievance?",
      answer: "The required documents vary depending on the type of grievance and the department involved. Generally, you may need identification proof, address proof, and any relevant supporting documents related to your complaint or request."
    },
    {
      question: "How long does it take to resolve a grievance?",
      answer: "Resolution time varies depending on the complexity of the issue and the department involved. Typically, grievances are resolved within 7-30 working days. You can track the progress through your dashboard."
    },
    {
      question: "Who can I contact for technical support?",
      answer: "For technical issues with the portal, you can contact our IT support team at support@kapurthala.gov.in or call our helpline. You can also visit our office during working hours for in-person assistance."
    }
  ];

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="faq-page">
      <div className="faq-container">
        <h1>Frequently Asked Questions</h1>
        <p className="faq-subtitle">Find answers to common questions about the Department Dashboard portal</p>
        
        <div className="faq-list">
          {faqs.map((faq, index) => (
            <div key={index} className={`faq-item ${activeIndex === index ? 'active' : ''}`}>
              <button 
                className="faq-question"
                onClick={() => toggleFAQ(index)}
                aria-expanded={activeIndex === index}
              >
                <span>{faq.question}</span>
                <span className={`faq-icon ${activeIndex === index ? 'rotate' : ''}`}>
                  ▼
                </span>
              </button>
              
              <div className={`faq-answer ${activeIndex === index ? 'show' : ''}`}>
                <p>{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="faq-contact">
          <h2>Still have questions?</h2>
          <p>If you couldn't find the answer you're looking for, please don't hesitate to contact us.</p>
          <div className="contact-options">
            <a href="mailto:support@kapurthala.gov.in" className="contact-btn">
              📧 Email Support
            </a>
            <a href="tel:1800-XXX-XXXX" className="contact-btn">
              📞 Call Helpline
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;