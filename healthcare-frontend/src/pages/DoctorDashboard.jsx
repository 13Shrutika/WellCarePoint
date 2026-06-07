import { useEffect, useState } from "react";
import API from "../services/api";
import LoginRegister from "./LoginRegister";

function DoctorDashboard() {
  const userRole = localStorage.getItem("userRole");
  const storedUser = JSON.parse(localStorage.getItem("userData") || "null");

  // State definitions
  const [appointments, setAppointments] = useState([]);
  const [doctorInfo, setDoctorInfo] = useState(null);
  
  // Modal State for adding Medical Record
  const [selectedApp, setSelectedApp] = useState(null); // the appointment being completed
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [recordForm, setRecordForm] = useState({
    height: "",
    weight: "",
    bloodPressure: "",
    heartRate: "",
    temperature: "98.6",
    symptoms: "",
    diagnosis: "",
    treatment: "",
  });

  // Repeating Patient History Panel State
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [selectedPatientName, setSelectedPatientName] = useState("");
  const [patientHistory, setPatientHistory] = useState([]);

  // Active filter tab: "today", "tomorrow", "all"
  const [activeTab, setActiveTab] = useState("today");

  const getTodayDateString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getTomorrowDateString = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const todayStr = getTodayDateString();
  const tomorrowStr = getTomorrowDateString();

  const isAuthorized = userRole === "doctor" && !!storedUser;

  const loadData = () => {
    if (!isAuthorized) return;
    const doctorId = storedUser.id;
    // Fetch doctor info
    API.get(`/api/doctors/${doctorId}`)
      .then((res) => setDoctorInfo(res.data))
      .catch((err) => console.error(err));

    // Fetch appointments
    API.get(`/api/appointments/doctor/${doctorId}`)
      .then((res) => setAppointments(res.data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    if (isAuthorized) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthorized]);

  // Guard routing after all hooks are evaluated
  if (!isAuthorized) {
    return <LoginRegister type="doctor" />;
  }

  const handleUpdateStatus = (id, newStatus) => {
    API.put(`/api/appointments/${id}/status`, null, {
      params: { status: newStatus }
    })
      .then(() => {
        loadData();
        // Clear history panel if the current active patient changed
        if (selectedPatientId) {
          fetchPatientHistory(selectedPatientId, selectedPatientName);
        }
      })
      .catch((err) => console.error(err));
  };

  // Open the "Complete Appointment / Add Record" Modal
  const openCompleteModal = (app) => {
    setSelectedApp(app);
    // Prefill with patient's details
    API.get(`/api/patients/${app.patientId}`)
      .then((res) => {
        setRecordForm({
          height: res.data.height || "",
          weight: res.data.weight || "",
          bloodPressure: "120/80",
          heartRate: "72",
          temperature: "98.6",
          symptoms: "",
          diagnosis: "",
          treatment: "",
        });
        setIsModalOpen(true);
      })
      .catch((err) => {
        console.error(err);
        setRecordForm({
          height: "",
          weight: "",
          bloodPressure: "120/80",
          heartRate: "72",
          temperature: "98.6",
          symptoms: "",
          diagnosis: "",
          treatment: "",
        });
        setIsModalOpen(true);
      });
  };

  const handleRecordSubmit = (e) => {
    e.preventDefault();

    const medicalRecordPayload = {
      patientId: selectedApp.patientId,
      doctorId: storedUser.id,
      doctorName: doctorInfo?.doctorName || "Dr. Smith",
      visitDate: todayStr,
      height: parseFloat(recordForm.height) || 0,
      weight: parseFloat(recordForm.weight) || 0,
      bloodPressure: recordForm.bloodPressure,
      heartRate: parseInt(recordForm.heartRate) || 0,
      temperature: parseFloat(recordForm.temperature) || 0,
      symptoms: recordForm.symptoms,
      diagnosis: recordForm.diagnosis,
      treatment: recordForm.treatment,
    };

    // Save medical record
    API.post("/api/medical-records", medicalRecordPayload)
      .then(() => {
        // Update appointment status to COMPLETED
        return API.put(`/api/appointments/${selectedApp.id}/status`, null, {
          params: { status: "COMPLETED" }
        });
      })
      .then(() => {
        setIsModalOpen(false);
        loadData();
        if (selectedPatientId === selectedApp.patientId) {
          fetchPatientHistory(selectedPatientId, selectedPatientName);
        }
      })
      .catch((err) => {
        console.error("Error completing appointment:", err);
        alert("Failed to complete appointment. Make sure inputs are correct.");
      });
  };

  // Fetch medical records history for a repeat patient
  const fetchPatientHistory = (patientId, patientName) => {
    setSelectedPatientId(patientId);
    setSelectedPatientName(patientName);
    API.get(`/api/medical-records/patient/${patientId}`)
      .then((res) => {
        setPatientHistory(res.data);
      })
      .catch((err) => console.error(err));
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.reload();
  };

  // Filter appointments based on active tab
  const filteredAppointments = appointments.filter((app) => {
    if (activeTab === "today") {
      return app.appointmentDate === todayStr;
    } else if (activeTab === "tomorrow") {
      return app.appointmentDate === tomorrowStr;
    }
    return true; // "all"
  });

  // Calculate repeat count for a patient
  const getPatientCompletedVisitsCount = (patientId) => {
    // Check appointments history that is COMPLETED
    return appointments.filter((app) => app.patientId === patientId && app.status === "COMPLETED").length;
  };

  // Custom SVG Trend Line Renderer for Repeat Patients
  const renderPatientTrendGraph = () => {
    if (patientHistory.length < 2) {
      return null;
    }

    const weights = patientHistory.map((r) => r.weight);
    const minWeight = Math.min(...weights) - 5;
    const maxWeight = Math.max(...weights) + 5;
    const range = maxWeight - minWeight;

    // SVG parameters
    const width = 350;
    const height = 120;
    const padding = 20;

    const points = patientHistory.map((record, index) => {
      const x = padding + (index * (width - 2 * padding)) / (patientHistory.length - 1);
      const y = height - padding - ((record.weight - minWeight) * (height - 2 * padding)) / (range || 1);
      return { x, y, weight: record.weight, date: record.visitDate };
    });

    const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

    return (
      <div className="mb-3">
        <h6 className="fw-semibold text-secondary small mb-2">Weight Trend Analytics (kg)</h6>
        <svg viewBox={`0 0 ${width} ${height}`} className="w-100 bg-white rounded-3 border">
          <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="#eee" strokeDasharray="2" />
          <path d={linePath} fill="none" stroke="#198754" strokeWidth="2.5" />
          {points.map((p, i) => (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r="4" fill="#fff" stroke="#198754" strokeWidth="2" />
              <text x={p.x} y={p.y - 8} fontSize="8" textAnchor="middle" fontWeight="bold" fill="#198754">
                {p.weight}
              </text>
              <text x={p.x} y={height - 2} fontSize="7" textAnchor="middle" fill="#999">
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
      <nav className="navbar navbar-expand-lg navbar-dark bg-success shadow-sm">
        <div className="container">
          <span className="navbar-brand fw-bold fs-3">🏥 HealthBuddy (Doctor Portal)</span>
          <div className="d-flex align-items-center">
            <span className="text-white me-3 d-none d-sm-inline">
              Welcome, <strong>{doctorInfo ? doctorInfo.doctorName : "Doctor"}</strong>
            </span>
            <button className="btn btn-outline-light btn-sm fw-semibold rounded-pill" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="container py-4">
        <div className="row g-4">
          
          {/* Left Column: Appointments List */}
          <div className={selectedPatientId ? "col-lg-7" : "col-lg-12"}>
            
            <div className="card shadow-sm border-0 rounded-4">
              <div className="card-body">
                
                {/* Filter Tabs */}
                <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                  <h4 className="fw-bold mb-0">Appointments Schedule</h4>
                  <div className="btn-group rounded-pill overflow-hidden shadow-sm" role="group">
                    <button
                      type="button"
                      className={`btn btn-sm px-3 ${activeTab === "today" ? "btn-success" : "btn-light"}`}
                      onClick={() => setActiveTab("today")}
                    >
                      Today's
                    </button>
                    <button
                      type="button"
                      className={`btn btn-sm px-3 ${activeTab === "tomorrow" ? "btn-success" : "btn-light"}`}
                      onClick={() => setActiveTab("tomorrow")}
                    >
                      Tomorrow's
                    </button>
                    <button
                      type="button"
                      className={`btn btn-sm px-3 ${activeTab === "all" ? "btn-success" : "btn-light"}`}
                      onClick={() => setActiveTab("all")}
                    >
                      All
                    </button>
                  </div>
                </div>

                {filteredAppointments.length === 0 ? (
                  <div className="text-center py-5 text-muted">
                    No appointments scheduled for this period.
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table align-middle">
                      <thead className="table-light">
                        <tr>
                          <th>Patient Info</th>
                          <th>Date / Slot</th>
                          <th>Status</th>
                          <th className="text-end">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredAppointments.map((app) => {
                          const isCompleted = app.status === "COMPLETED";
                          const isAccepted = app.status === "ACCEPTED";
                          const isPending = app.status === "PENDING";
                          const isRejected = app.status === "REJECTED";

                          // Repeat visitor indicator
                          const isRepeat = getPatientCompletedVisitsCount(app.patientId) > 0;

                          return (
                            <tr key={app.id} className={selectedPatientId === app.patientId ? "table-success-subtle" : ""}>
                              <td>
                                <div className="fw-semibold">
                                  {app.patientName}{" "}
                                  {isRepeat && (
                                    <span className="badge bg-info text-dark rounded-pill fw-bold small ms-1" style={{ fontSize: "10px" }}>
                                      Repeat Patient
                                    </span>
                                  )}
                                </div>
                                <small className="text-muted d-block">Age: {app.patientAge} | Mob: {app.patientMobile}</small>
                                {isRepeat && (
                                  <button
                                    className="btn btn-link p-0 text-success fw-bold small text-decoration-none"
                                    style={{ fontSize: "12px" }}
                                    onClick={() => fetchPatientHistory(app.patientId, app.patientName)}
                                  >
                                    🔍 View Progress Analytics
                                  </button>
                                )}
                              </td>
                              <td>
                                <div className="fw-semibold text-secondary">{app.appointmentDate}</div>
                                <small className="text-muted">{app.timeSlot}</small>
                              </td>
                              <td>
                                <span
                                  className={`badge rounded-pill px-2.5 py-1.5 fw-bold ${
                                    isCompleted
                                      ? "bg-info-subtle text-info"
                                      : isAccepted
                                      ? "bg-success-subtle text-success"
                                      : isPending
                                      ? "bg-warning-subtle text-warning"
                                      : "bg-danger-subtle text-danger"
                                  }`}
                                >
                                  {app.status}
                                </span>
                              </td>
                              <td className="text-end">
                                {isPending && (
                                  <div className="d-flex justify-content-end gap-1">
                                    <button
                                      className="btn btn-sm btn-success rounded-pill fw-bold"
                                      onClick={() => handleUpdateStatus(app.id, "ACCEPTED")}
                                    >
                                      Accept
                                    </button>
                                    <button
                                      className="btn btn-sm btn-outline-danger rounded-pill fw-bold"
                                      onClick={() => handleUpdateStatus(app.id, "REJECTED")}
                                    >
                                      Reject
                                    </button>
                                  </div>
                                )}
                                {isAccepted && (
                                  <button
                                    className="btn btn-sm btn-primary rounded-pill fw-bold"
                                    onClick={() => openCompleteModal(app)}
                                  >
                                    Add Medical Record
                                  </button>
                                )}
                                {isCompleted && (
                                  <span className="text-muted small italic">Report Created</span>
                                )}
                                {isRejected && (
                                  <span className="text-danger small fw-semibold">Canceled</span>
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

          </div>

          {/* Right Column: Repeating Patient Health Reports & Progress Analytics Panel */}
          {selectedPatientId && (
            <div className="col-lg-5">
              <div className="card shadow-sm border-0 rounded-4 bg-light-subtle position-sticky" style={{ top: "20px" }}>
                <div className="card-header bg-success text-white rounded-top-4 d-flex justify-content-between align-items-center py-3">
                  <h5 className="fw-bold mb-0">📈 Progress Analytics</h5>
                  <button className="btn-close btn-close-white" onClick={() => setSelectedPatientId(null)}></button>
                </div>
                <div className="card-body">
                  <h5 className="fw-bold text-success mb-1">{selectedPatientName}</h5>
                  <p className="text-muted small mb-3">Historical Medical History & Trends</p>

                  {/* Weight Graph */}
                  {renderPatientTrendGraph()}

                  {/* Consultation List */}
                  <h6 className="fw-bold border-bottom pb-1 mb-2 text-secondary">Past Health Reports ({patientHistory.length})</h6>
                  {patientHistory.length === 0 ? (
                    <div className="text-muted small py-2">No past clinical records found for this patient.</div>
                  ) : (
                    <div style={{ maxHeight: "250px", overflowY: "auto" }}>
                      {patientHistory.map((rec) => (
                        <div key={rec.id} className="bg-white p-3 rounded-3 border mb-2 shadow-sm">
                          <div className="d-flex justify-content-between align-items-center mb-1">
                            <span className="badge bg-success-subtle text-success small">{rec.visitDate}</span>
                            <small className="text-muted">Dr: {rec.doctorName}</small>
                          </div>
                          <div className="row g-2 mb-2 text-center text-secondary small border-bottom pb-1" style={{ fontSize: "11px" }}>
                            <div className="col-4"><strong>Wt:</strong> {rec.weight}kg</div>
                            <div className="col-4"><strong>BP:</strong> {rec.bloodPressure}</div>
                            <div className="col-4"><strong>Temp:</strong> {rec.temperature}°F</div>
                          </div>
                          <div className="small">
                            <div><strong>Diagnosis:</strong></div>
                            <div className="text-secondary mb-1" style={{ fontSize: "12px" }}>{rec.diagnosis}</div>
                            <div><strong>Treatment / Prescription:</strong></div>
                            <div className="text-primary fw-semibold" style={{ fontSize: "12px" }}>{rec.treatment}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* React Custom Modal - Add Medical Record Overlay */}
      {isModalOpen && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <div className="modal-header bg-primary text-white rounded-top-4 py-3">
                <h5 className="modal-title fw-bold">🏥 Add Medical Record</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setIsModalOpen(false)}></button>
              </div>
              <form onSubmit={handleRecordSubmit}>
                <div className="modal-body">
                  <p className="text-muted small">Enter clinical details to complete consultation for <strong>{selectedApp?.patientName}</strong>.</p>
                  
                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label text-secondary fw-semibold small">Height (cm)</label>
                      <input
                        type="number"
                        step="0.1"
                        className="form-control rounded-3"
                        value={recordForm.height}
                        onChange={(e) => setRecordForm({ ...recordForm, height: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label text-secondary fw-semibold small">Weight (kg)</label>
                      <input
                        type="number"
                        step="0.1"
                        className="form-control rounded-3"
                        value={recordForm.weight}
                        onChange={(e) => setRecordForm({ ...recordForm, weight: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-4">
                      <label className="form-label text-secondary fw-semibold small">Blood Pressure</label>
                      <input
                        type="text"
                        className="form-control rounded-3"
                        placeholder="120/80"
                        value={recordForm.bloodPressure}
                        onChange={(e) => setRecordForm({ ...recordForm, bloodPressure: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-4">
                      <label className="form-label text-secondary fw-semibold small">Heart Rate (bpm)</label>
                      <input
                        type="number"
                        className="form-control rounded-3"
                        placeholder="72"
                        value={recordForm.heartRate}
                        onChange={(e) => setRecordForm({ ...recordForm, heartRate: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-4">
                      <label className="form-label text-secondary fw-semibold small">Temp (°F)</label>
                      <input
                        type="number"
                        step="0.1"
                        className="form-control rounded-3"
                        value={recordForm.temperature}
                        onChange={(e) => setRecordForm({ ...recordForm, temperature: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label text-secondary fw-semibold small">Symptoms</label>
                    <textarea
                      rows="2"
                      className="form-control rounded-3"
                      placeholder="e.g. Fever, cough, fatigue..."
                      value={recordForm.symptoms}
                      onChange={(e) => setRecordForm({ ...recordForm, symptoms: e.target.value })}
                      required
                    ></textarea>
                  </div>

                  <div className="mb-3">
                    <label className="form-label text-secondary fw-semibold small">Diagnosis</label>
                    <input
                      type="text"
                      className="form-control rounded-3"
                      placeholder="e.g. Mild Influenza"
                      value={recordForm.diagnosis}
                      onChange={(e) => setRecordForm({ ...recordForm, diagnosis: e.target.value })}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label text-secondary fw-semibold small">Treatment & Prescriptions</label>
                    <textarea
                      rows="2"
                      className="form-control rounded-3"
                      placeholder="e.g. Paracetamol 500mg, bed rest..."
                      value={recordForm.treatment}
                      onChange={(e) => setRecordForm({ ...recordForm, treatment: e.target.value })}
                      required
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer border-0 pt-0">
                  <button type="button" className="btn btn-secondary rounded-pill px-3 fw-bold" onClick={() => setIsModalOpen(false)}>
                    Close
                  </button>
                  <button type="submit" className="btn btn-success rounded-pill px-4 fw-bold shadow-sm">
                    Submit & Complete
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DoctorDashboard;