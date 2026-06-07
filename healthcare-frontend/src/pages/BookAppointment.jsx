import { useState } from "react";
import API from "../services/api";

function BookAppointment() {

  const [appointment, setAppointment] = useState({
    patientId: "",
    doctorId: "",
    appointmentDate: "",
    status: "PENDING"
  });

  const handleChange = (e) => {
    setAppointment({
      ...appointment,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    API.post("/api/appointments", appointment)
      .then(() => {
        alert("Appointment Booked Successfully!");

        setAppointment({
          patientId: "",
          doctorId: "",
          appointmentDate: "",
          status: "PENDING"
        });
      })
      .catch((error) => {
        console.error(error);
        alert("Error booking appointment");
      });
  };

  return (
    <div className="container mt-5">

      <h2>Book Appointment</h2>

      <form onSubmit={handleSubmit}>

        <div className="mb-3">
          <label>Patient ID</label>
          <input
            type="number"
            name="patientId"
            className="form-control"
            value={appointment.patientId}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label>Doctor ID</label>
          <input
            type="number"
            name="doctorId"
            className="form-control"
            value={appointment.doctorId}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label>Appointment Date</label>
          <input
            type="date"
            name="appointmentDate"
            className="form-control"
            value={appointment.appointmentDate}
            onChange={handleChange}
            required
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary"
        >
          Book Appointment
        </button>

      </form>

    </div>
  );
}

export default BookAppointment;