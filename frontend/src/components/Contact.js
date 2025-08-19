import React from 'react';
import './Contact.css';

const Contact = () => {
  return (
    <div className="contact-container">
      {/* <h1>Contact Us</h1> */}
      <div className="contact-details">
        <h2>Servizo Help Center</h2>
        <p>Email: <a href="mailto:servizo@gmail.com">servizo@gmail.com</a></p>
        <p>
          Head Office: Chittagong, Bangladesh<br />
          Address: Computer Science and Engineering Department,<br />
          University of Chittagong
        </p>
      </div>
    </div>
  );
};

export default Contact;
