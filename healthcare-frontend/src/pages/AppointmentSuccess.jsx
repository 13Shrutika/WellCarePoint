import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./AppointmentSuccess.css";

const AppointmentSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Data coming from booking page (optional)
  const appointment = location.state || {
    doctorName: "Dr. Unknown",
    date: "Not Available",
    time: "Not Available",
    department: "General",
    appointmentId: "AUTO12345",
  };

  return (
    <div className="success-container">
      <div className="success-card">
        
        <div className="checkmark">✔️</div>

        <h1>Appointment Booked Successfully</h1>
        <p className="sub-text">
          Your appointment has been confirmed. Please find details below.
        </p>

        <div className="details-box">
          <p><strong>Appointment ID:</strong> {appointment.appointmentId}</p>
          <p><strong>Doctor:</strong> {appointment.doctorName}</p>
          <p><strong>Department:</strong> {appointment.department}</p>
          <p><strong>Date:</strong> {appointment.date}</p>
          <p><strong>Time:</strong> {appointment.time}</p>
        </div>

        <div className="button-group">
          <button onClick={() => navigate("/patient-dashboard")}>
            Go to Dashboard
          </button>

          <button onClick={() => navigate("/book-appointment")}>
            Book Another
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppointmentSuccess;