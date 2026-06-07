import { useEffect, useState } from "react";
import API from "../services/api";
import LoginRegister from "./LoginRegister";

function PatientDashboard() {
  const userRole = localStorage.getItem("userRole");
  const storedUser = JSON.parse(localStorage.getItem("userData") || "null");

  // State definitions
  const [patientInfo, setPatientInfo] = useState(null);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
  
  // Booking Form State
  const [bookingForm, setBookingForm] = useState({
    doctorId: "",
    patientName: "",
    patientAge: "",
    patientMobile: "",
    appointmentDate: "",
    timeSlot: "",
  });

  // Profile Edit State
  const [profileEdit, setProfileEdit] = useState({
    height: "",
    weight: "",
  });

  const [bookingError, setBookingError] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");
  
  // Static time slots
  const allSlots = [
    "09:00 AM - 10:00 AM",
    "10:00 AM - 11:00 AM",
    "11:00 AM - 12:00 PM",
    "02:00 PM - 03:00 PM",
    "03:00 PM - 04:00 PM",
    "04:00 PM - 05:00 PM",
  ];

  // Static Health Tips
  const healthTips = [
    { title: "Stay Hydrated", text: "Aim to drink at least 8-10 glasses (2 liters) of water daily to keep organs functioning well." },
    { title: "Daily Movement", text: "A moderate 30-minute walk daily boosts cardiovascular health, improves mood, and strengthens bones." },
    { title: "Quality Sleep", text: "Prioritize 7-8 hours of sound sleep to help your body repair tissues and consolidate memory." },
    { title: "Posture Check", text: "Keep your spine aligned when sitting at a desk. Take breaks every hour to stretch." },
    { title: "Eat Colors", text: "Incorporate a variety of colorful vegetables and fruits in your meals for rich antioxidants." },
  ];
  const [tipIndex, setTipIndex] = useState(0);

  // Rotate health tip every 10 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % healthTips.length);
    }, 10000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isAuthorized = userRole === "patient" && !!storedUser;

  // Fetch all initial data
  const loadData = () => {
    if (!isAuthorized) return;
    const patientId = storedUser.id;

    // Fetch patient details
    API.get(`/api/patients/${patientId}`)
      .then((res) => {
        setPatientInfo(res.data);
        setProfileEdit({
          height: res.data.height || "",
          weight: res.data.weight || "",
        });
      })
      .catch((err) => console.error("Error fetching patient details:", err));

    // Fetch medical records
    API.get(`/api/medical-records/patient/${patientId}`)
      .then((res) => setMedicalRecords(res.data))
      .catch((err) => console.error("Error fetching medical records:", err));

    // Fetch appointments
    API.get(`/api/appointments/patient/${patientId}`)
      .then((res) => setAppointments(res.data))
      .catch((err) => console.error("Error fetching appointments:", err));

    // Fetch doctors list
    API.get("/api/doctors")
      .then((res) => setDoctors(res.data))
      .catch((err) => console.error("Error fetching doctors list:", err));
  };

  useEffect(() => {
    if (isAuthorized) {
      loadData();
      // Default fill booking fields with profile info
      setBookingForm((prev) => ({
        ...prev,
        patientName: storedUser.name || "",
        patientAge: storedUser.age || "",
        patientMobile: storedUser.mobile || "",
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthorized]);

  // Fetch booked slots when doctor or date changes
  useEffect(() => {
    if (isAuthorized && bookingForm.doctorId && bookingForm.appointmentDate) {
      API.get("/api/appointments/booked-slots", {
        params: {
          doctorId: bookingForm.doctorId,
          date: bookingForm.appointmentDate,
        },
      })
        .then((res) => {
          setBookedSlots(res.data);
          // Reset time slot if the newly fetched list contains the currently selected slot
          if (res.data.includes(bookingForm.timeSlot)) {
            setBookingForm((prev) => ({ ...prev, timeSlot: "" }));
          }
        })
        .catch((err) => console.error("Error fetching booked slots:", err));
    } else {
      setBookedSlots((prev) => (prev.length > 0 ? [] : prev));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingForm.doctorId, bookingForm.appointmentDate, isAuthorized]);

  // Guard routing after all hooks are evaluated
  if (!isAuthorized) {
    return <LoginRegister type="patient" />;
  }

  const handleBookingChange = (e) => {
    setBookingForm({
      ...bookingForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    setBookingError("");
    setBookingSuccess("");

    const payload = {
      patientId: storedUser.id,
      doctorId: parseInt(bookingForm.doctorId),
      patientName: bookingForm.patientName,
      patientAge: parseInt(bookingForm.patientAge),
      patientMobile: bookingForm.patientMobile,
      appointmentDate: bookingForm.appointmentDate,
      timeSlot: bookingForm.timeSlot,
      status: "PENDING",
    };

    API.post("/api/appointments", payload)
      .then(() => {
        setBookingSuccess("Appointment booked successfully! Waiting for doctor confirmation.");
        setBookingForm({
          doctorId: "",
          patientName: storedUser.name || "",
          patientAge: storedUser.age || "",
          patientMobile: storedUser.mobile || "",
          appointmentDate: "",
          timeSlot: "",
        });
        loadData();
      })
      .catch((err) => {
        setBookingError(err.response?.data?.message || "Failed to book appointment. Please try again.");
      });
  };

  const handleProfileUpdate = (e) => {
    e.preventDefault();
    setProfileSuccess("");

    API.put(`/api/patients/${storedUser.id}/profile`, {
      height: parseFloat(profileEdit.height),
      weight: parseFloat(profileEdit.weight),
    })
      .then((res) => {
        setProfileSuccess("Stats updated successfully!");
        setPatientInfo(res.data);
        loadData();
      })
      .catch((err) => console.error("Error updating stats:", err));
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.reload();
  };

  const handleCancelAppointment = (id) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
    API.put(`/api/appointments/${id}/cancel`)
      .then(() => {
        loadData();
      })
      .catch((err) => {
        alert(err.response?.data?.message || "Failed to cancel the appointment.");
      });
  };

  // Custom SVG Line Graph Renderer for Weight History
  const renderWeightGraph = () => {
    if (medicalRecords.length < 2) {
      return (
        <div className="text-center py-4 text-muted bg-light rounded-3">
          Need at least 2 checkups/medical records to generate weight trend graphs.
        </div>
      );
    }

    const weights = medicalRecords.map((r) => r.weight);
    const minWeight = Math.min(...weights) - 5;
    const maxWeight = Math.max(...weights) + 5;
    const range = maxWeight - minWeight;

    // SVG parameters
    const width = 400;
    const height = 150;
    const padding = 20;

    const points = medicalRecords.map((record, index) => {
      const x = padding + (index * (width - 2 * padding)) / (medicalRecords.length - 1);
      // invert Y since SVG coordinates start from top-left
      const y = height - padding - ((record.weight - minWeight) * (height - 2 * padding)) / range;
      return { x, y, weight: record.weight, date: record.visitDate };
    });

    const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

    return (
      <div>
        <svg viewBox={`0 0 ${width} ${height}`} className="w-100 bg-light rounded-3 shadow-sm border border-light-subtle">
          {/* Grid lines */}
          <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="#ddd" strokeDasharray="4" />
          
          {/* Trend Line */}
          <path d={linePath} fill="none" stroke="#0d6efd" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          
          {/* Data Points */}
          {points.map((p, i) => (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r="5" fill="#fff" stroke="#0d6efd" strokeWidth="2.5" />
              <text x={p.x} y={p.y - 10} fontSize="10" textAnchor="middle" fontWeight="bold" fill="#0d6efd">
                {p.weight}kg
              </text>
              <text x={p.x} y={height - 4} fontSize="8" textAnchor="middle" fill="#6c757d">
                {p.date.substring(5)}
              </text>
            </g>
          ))}
        </svg>
      </div>
    );
  };

  return (
    <div>
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
        <div className="container">
          <span className="navbar-brand fw-bold fs-3">🏥 HealthBuddy</span>
          <div className="d-flex align-items-center">
            <span className="text-white me-3 d-none d-sm-inline">
              Welcome, <strong>{patientInfo?.name || "Patient"}</strong>
            </span>
            <button className="btn btn-outline-light btn-sm fw-semibold rounded-pill" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="container py-4">
        <div className="row g-4">
          
          {/* Left Column: Profile, Stats, and Health Tip */}
          <div className="col-lg-4">
            
            {/* Profile Info Card */}
            <div className="card shadow-sm border-0 rounded-4 mb-4">
              <div className="card-body">
                <h4 className="fw-bold mb-3 border-bottom pb-2">My Profile</h4>
                <div className="mb-2">
                  <small className="text-muted d-block">Full Name</small>
                  <span className="fw-semibold">{patientInfo?.name}</span>
                </div>
                <div className="mb-2">
                  <small className="text-muted d-block">Email Address</small>
                  <span className="fw-semibold">{patientInfo?.email}</span>
                </div>
                <div className="row">
                  <div className="col-6 mb-2">
                    <small className="text-muted d-block">Age</small>
                    <span className="fw-semibold">{patientInfo?.age} Yrs</span>
                  </div>
                  <div className="col-6 mb-2">
                    <small className="text-muted d-block">Gender</small>
                    <span className="fw-semibold">{patientInfo?.gender}</span>
                  </div>
                </div>
                <div className="row border-top pt-3 mt-2">
                  <div className="col-6 text-center border-end">
                    <small className="text-muted d-block">Height</small>
                    <span className="fs-5 fw-bold text-primary">{patientInfo?.height || "--"} cm</span>
                  </div>
                  <div className="col-6 text-center">
                    <small className="text-muted d-block">Weight</small>
                    <span className="fs-5 fw-bold text-primary">{patientInfo?.weight || "--"} kg</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats Update Form */}
            <div className="card shadow-sm border-0 rounded-4 mb-4">
              <div className="card-body">
                <h5 className="fw-bold mb-3">Update My Stats</h5>
                {profileSuccess && <div className="alert alert-success py-2">{profileSuccess}</div>}
                <form onSubmit={handleProfileUpdate}>
                  <div className="row g-2">
                    <div className="col-6">
                      <label className="small text-secondary fw-semibold">Height (cm)</label>
                      <input
                        type="number"
                        step="0.1"
                        className="form-control form-control-sm rounded-3"
                        value={profileEdit.height}
                        onChange={(e) => setProfileEdit({ ...profileEdit, height: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-6">
                      <label className="small text-secondary fw-semibold">Weight (kg)</label>
                      <input
                        type="number"
                        step="0.1"
                        className="form-control form-control-sm rounded-3"
                        value={profileEdit.weight}
                        onChange={(e) => setProfileEdit({ ...profileEdit, weight: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <button type="submit" className="btn btn-outline-primary btn-sm w-100 mt-3 rounded-pill fw-semibold">
                    Save Stats
                  </button>
                </form>
              </div>
            </div>

            {/* Rotating Health Tip */}
            <div className="card shadow-sm border-0 rounded-4 bg-primary-subtle text-primary-emphasis">
              <div className="card-body">
                <div className="d-flex align-items-center mb-2">
                  <span className="fs-4 me-2">💡</span>
                  <h5 className="fw-bold mb-0">Health Tip of the Day</h5>
                </div>
                <h6 className="fw-bold">{healthTips[tipIndex].title}</h6>
                <p className="card-text small mb-0 transition-opacity">{healthTips[tipIndex].text}</p>
              </div>
            </div>

          </div>

          {/* Right Column: Appointment Booking & History */}
          <div className="col-lg-8">
            
            {/* Book Appointment Card */}
            <div className="card shadow-sm border-0 rounded-4 mb-4">
              <div className="card-body">
                <h4 className="fw-bold mb-3 border-bottom pb-2">Book a New Appointment</h4>
                {bookingError && <div className="alert alert-danger py-2">{bookingError}</div>}
                {bookingSuccess && <div className="alert alert-success py-2">{bookingSuccess}</div>}
                
                <form onSubmit={handleBookingSubmit}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label text-secondary fw-semibold">Select Doctor</label>
                      <select
                        name="doctorId"
                        className="form-select rounded-3"
                        value={bookingForm.doctorId}
                        onChange={handleBookingChange}
                        required
                      >
                        <option value="">-- Select Doctor --</option>
                        {doctors.map((doc) => (
                          <option key={doc.id} value={doc.id}>
                            {doc.doctorName} ({doc.specialization})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label text-secondary fw-semibold">Appointment Date</label>
                      <input
                        type="date"
                        name="appointmentDate"
                        className="form-control rounded-3"
                        min={new Date().toISOString().split("T")[0]}
                        value={bookingForm.appointmentDate}
                        onChange={handleBookingChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="row g-3 mt-2">
                    <div className="col-md-4">
                      <label className="form-label text-secondary fw-semibold">Patient Name</label>
                      <input
                        type="text"
                        name="patientName"
                        className="form-control rounded-3"
                        value={bookingForm.patientName}
                        onChange={handleBookingChange}
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label text-secondary fw-semibold">Age</label>
                      <input
                        type="number"
                        name="patientAge"
                        className="form-control rounded-3"
                        value={bookingForm.patientAge}
                        onChange={handleBookingChange}
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label text-secondary fw-semibold">Mobile No.</label>
                      <input
                        type="tel"
                        name="patientMobile"
                        className="form-control rounded-3"
                        value={bookingForm.patientMobile}
                        onChange={handleBookingChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-3 mt-3">
                    <label className="form-label text-secondary fw-semibold">Available Time Slots</label>
                    <div className="d-flex flex-wrap gap-2">
                      {allSlots.map((slot) => {
                        const isBooked = bookedSlots.includes(slot);
                        return (
                          <button
                            key={slot}
                            type="button"
                            disabled={isBooked}
                            className={`btn btn-sm rounded-pill px-3 py-2 fw-semibold border ${
                              bookingForm.timeSlot === slot
                                ? "btn-primary border-primary"
                                : isBooked
                                ? "btn-light text-muted border-light-subtle"
                                : "btn-outline-secondary"
                            }`}
                            onClick={() => setBookingForm({ ...bookingForm, timeSlot: slot })}
                          >
                            {slot} {isBooked && "(Booked)"}
                          </button>
                        );
                      })}
                    </div>
                    {!bookingForm.doctorId || !bookingForm.appointmentDate ? (
                      <small className="text-muted mt-2 d-block">
                        * Please select a Doctor and Date first to check slot availability.
                      </small>
                    ) : null}
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary rounded-pill px-4 fw-bold shadow-sm"
                    disabled={!bookingForm.doctorId || !bookingForm.appointmentDate || !bookingForm.timeSlot}
                  >
                    Confirm Booking
                  </button>
                </form>
              </div>
            </div>

            {/* Booked Appointments Table */}
            <div className="card shadow-sm border-0 rounded-4 mb-4">
              <div className="card-body">
                <h4 className="fw-bold mb-3 border-bottom pb-2">Booked Appointments</h4>
                {appointments.length === 0 ? (
                  <p className="text-muted py-2">No appointments booked yet.</p>
                ) : (
                  <div className="table-responsive">
                    <table className="table align-middle">
                      <thead className="table-light">
                        <tr>
                          <th>Doctor</th>
                          <th>Date</th>
                          <th>Time Slot</th>
                          <th>Patient Name</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {appointments.map((app) => {
                          const doc = doctors.find((d) => d.id === app.doctorId);
                          let statusClass = "bg-warning-subtle text-warning";
                          if (app.status === "ACCEPTED") statusClass = "bg-success-subtle text-success";
                          if (app.status === "REJECTED") statusClass = "bg-danger-subtle text-danger";
                          if (app.status === "COMPLETED") statusClass = "bg-info-subtle text-info";
                          if (app.status === "CANCELLED") statusClass = "bg-secondary-subtle text-secondary";

                          const canCancel = app.status === "PENDING" || app.status === "ACCEPTED";

                          return (
                            <tr key={app.id}>
                              <td>
                                <div className="fw-semibold">{doc ? doc.doctorName : `Dr. ID ${app.doctorId}`}</div>
                                <small className="text-muted">{doc?.specialization}</small>
                              </td>
                              <td>{app.appointmentDate}</td>
                              <td>{app.timeSlot}</td>
                              <td>{app.patientName}</td>
                              <td>
                                <span className={`badge ${statusClass} rounded-pill px-2 py-1 fw-bold`}>
                                  {app.status}
                                </span>
                              </td>
                              <td>
                                {canCancel ? (
                                  <button
                                    className="btn btn-sm btn-outline-danger rounded-pill fw-semibold"
                                    onClick={() => handleCancelAppointment(app.id)}
                                  >
                                    Cancel
                                  </button>
                                ) : (
                                  <span className="text-muted small">—</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Progress Analytics Graph */}
            <div className="card shadow-sm border-0 rounded-4 mb-4">
              <div className="card-body">
                <h4 className="fw-bold mb-3 border-bottom pb-2">Weight Progress Analytics</h4>
                {renderWeightGraph()}
              </div>
            </div>

            {/* Medical History Section */}
            <div className="card shadow-sm border-0 rounded-4">
              <div className="card-body">
                <h4 className="fw-bold mb-3 border-bottom pb-2">Medical History & Clinical Reports</h4>
                {medicalRecords.length === 0 ? (
                  <p className="text-muted py-2">No clinical reports available yet. Reports are added by your doctor upon completion of appointments.</p>
                ) : (
                  <div className="accordion rounded-3 overflow-hidden" id="medicalHistoryAccordion">
                    {medicalRecords.map((rec, idx) => (
                      <div className="accordion-item" key={rec.id}>
                        <h2 className="accordion-header">
                          <button
                            className="accordion-button collapsed fw-semibold"
                            type="button"
                            data-bs-toggle="collapse"
                            data-bs-target={`#collapseRecord${rec.id}`}
                            aria-expanded="false"
                            aria-controls={`collapseRecord${rec.id}`}
                          >
                            📅 Consultation Date: {rec.visitDate} — with {rec.doctorName || `Dr. ID ${rec.doctorId}`}
                          </button>
                        </h2>
                        <div
                          id={`collapseRecord${rec.id}`}
                          className="accordion-collapse collapse"
                          data-bs-parent="#medicalHistoryAccordion"
                        >
                          <div className="accordion-body bg-light-subtle">
                            <div className="row g-3">
                              <div className="col-md-3 text-center border-end">
                                <div className="small text-muted">Vitals Summary</div>
                                <div className="mt-2"><strong>Height:</strong> {rec.height} cm</div>
                                <div><strong>Weight:</strong> {rec.weight} kg</div>
                                <div><strong>BP:</strong> {rec.bloodPressure}</div>
                                <div><strong>HR:</strong> {rec.heartRate} bpm</div>
                                <div><strong>Temp:</strong> {rec.temperature}°F</div>
                              </div>
                              <div className="col-md-9">
                                <div><strong>Symptoms:</strong></div>
                                <p className="text-secondary small">{rec.symptoms || "None reported"}</p>
                                <div><strong>Diagnosis:</strong></div>
                                <p className="text-secondary small">{rec.diagnosis}</p>
                                <div><strong>Treatment & Prescription:</strong></div>
                                <p className="text-secondary small fw-semibold text-primary">{rec.treatment}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}

export default PatientDashboard;