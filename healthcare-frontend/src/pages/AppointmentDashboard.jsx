import { useEffect, useState } from "react";
import API from "../services/api";

function AppointmentDashboard() {

  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    API.get("/api/appointments")
      .then((response) => {
        setAppointments(response.data);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  return (
    <div className="container mt-5">

      <h2>Appointment Dashboard</h2>

      <table className="table table-bordered mt-4">

        <thead>
          <tr>
            <th>ID</th>
            <th>Patient ID</th>
            <th>Doctor ID</th>
            <th>Appointment Date</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {appointments.map((appointment) => (
            <tr key={appointment.id}>
              <td>{appointment.id}</td>
              <td>{appointment.patientId}</td>
              <td>{appointment.doctorId}</td>
              <td>{appointment.appointmentDate}</td>
              <td>{appointment.status}</td>
            </tr>
          ))}
        </tbody>

      </table>

    </div>
  );
}

export default AppointmentDashboard;