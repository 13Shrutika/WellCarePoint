import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";

function LoginRegister({ type }) {
  const isPatient = type === "patient";
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  // Login form data
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  // Patient Register data
  const [patientData, setPatientData] = useState({
    name: "",
    email: "",
    mobile: "",
    age: "",
    gender: "Male",
    password: "",
    height: "",
    weight: "",
  });

  // Doctor Register data
  const [doctorData, setDoctorData] = useState({
    doctorName: "",
    specialization: "",
    email: "",
    phone: "",
    experience: "",
    password: "",
  });

  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handlePatientChange = (e) => {
    setPatientData({ ...patientData, [e.target.name]: e.target.value });
  };

  const handleDoctorChange = (e) => {
    setDoctorData({ ...doctorData, [e.target.name]: e.target.value });
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const url = isPatient ? "/api/patients/login" : "/api/doctors/login";
    API.post(url, loginData)
      .then((res) => {
        setSuccess("Login successful!");
        localStorage.setItem("userRole", type);
        localStorage.setItem("userData", JSON.stringify(res.data));
        
        // Redirect after a short delay
        setTimeout(() => {
          window.location.href = isPatient ? "/patient" : "/doctor";
        }, 1000);
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Invalid email or password. Please try again.");
      });
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (isPatient) {
      // Create patient
      const payload = {
        ...patientData,
        age: parseInt(patientData.age),
        height: parseFloat(patientData.height) || 0,
        weight: parseFloat(patientData.weight) || 0,
      };

      API.post("/api/patients/register", payload)
        .then(() => {
          setSuccess("Patient registration successful! You can now log in.");
          setIsLogin(true);
        })
        .catch((err) => {
          setError(err.response?.data?.message || "Registration failed. Email might already be registered.");
        });
    } else {
      // Create doctor
      const payload = {
        ...doctorData,
        experience: parseInt(doctorData.experience) || 0,
      };

      API.post("/api/doctors/register", payload)
        .then(() => {
          setSuccess("Doctor registration successful! You can now log in.");
          setIsLogin(true);
        })
        .catch((err) => {
          setError(err.response?.data?.message || "Registration failed. Email might already be registered.");
        });
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card shadow border-0 rounded-4 overflow-hidden">
            <div className={`p-4 text-white text-center ${isPatient ? "bg-primary" : "bg-success"}`}>
              <h2 className="fw-bold mb-0">
                {isPatient ? "🏥 Patient Portal" : "👨‍⚕️ Doctor Portal"}
              </h2>
              <p className="mb-0 mt-2 opacity-75">
                {isLogin ? "Sign in to your account" : "Create a new account"}
              </p>
            </div>

            <div className="card-body p-4">
              {error && <div className="alert alert-danger py-2">{error}</div>}
              {success && <div className="alert alert-success py-2">{success}</div>}

              {/* Login / Register Toggle Tabs */}
              <div className="d-flex mb-4 border-bottom">
                <button
                  type="button"
                  className={`btn w-50 py-2 border-0 rounded-0 fw-semibold ${
                    isLogin ? "border-bottom border-3 text-primary border-primary" : "text-muted"
                  }`}
                  style={{ textDecoration: "none" }}
                  onClick={() => {
                    setIsLogin(true);
                    setError("");
                    setSuccess("");
                  }}
                >
                  Login
                </button>
                <button
                  type="button"
                  className={`btn w-50 py-2 border-0 rounded-0 fw-semibold ${
                    !isLogin ? "border-bottom border-3 text-primary border-primary" : "text-muted"
                  }`}
                  style={{ textDecoration: "none" }}
                  onClick={() => {
                    setIsLogin(false);
                    setError("");
                    setSuccess("");
                  }}
                >
                  Register
                </button>
              </div>

              {isLogin ? (
                /* LOGIN FORM */
                <form onSubmit={handleLoginSubmit}>
                  <div className="mb-3">
                    <label className="form-label text-secondary fw-semibold">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      className="form-control rounded-3"
                      value={loginData.email}
                      onChange={handleLoginChange}
                      placeholder="name@example.com"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label text-secondary fw-semibold">Password</label>
                    <input
                      type="password"
                      name="password"
                      className="form-control rounded-3"
                      value={loginData.password}
                      onChange={handleLoginChange}
                      placeholder="••••••••"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className={`btn w-100 py-2.5 rounded-3 text-white fw-bold ${
                      isPatient ? "btn-primary" : "btn-success"
                    }`}
                  >
                    Log In
                  </button>
                </form>
              ) : (
                /* REGISTRATION FORM */
                <form onSubmit={handleRegisterSubmit}>
                  {isPatient ? (
                    /* Patient Fields */
                    <>
                      <div className="mb-3">
                        <label className="form-label text-secondary fw-semibold">Full Name</label>
                        <input
                          type="text"
                          name="name"
                          className="form-control rounded-3"
                          value={patientData.name}
                          onChange={handlePatientChange}
                          placeholder="John Doe"
                          required
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label text-secondary fw-semibold">Email Address</label>
                        <input
                          type="email"
                          name="email"
                          className="form-control rounded-3"
                          value={patientData.email}
                          onChange={handlePatientChange}
                          placeholder="johndoe@email.com"
                          required
                        />
                      </div>

                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label className="form-label text-secondary fw-semibold">Mobile No.</label>
                          <input
                            type="tel"
                            name="mobile"
                            className="form-control rounded-3"
                            value={patientData.mobile}
                            onChange={handlePatientChange}
                            placeholder="1234567890"
                            required
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label text-secondary fw-semibold">Age</label>
                          <input
                            type="number"
                            name="age"
                            className="form-control rounded-3"
                            value={patientData.age}
                            onChange={handlePatientChange}
                            placeholder="25"
                            required
                          />
                        </div>
                      </div>

                      <div className="mb-3">
                        <label className="form-label text-secondary fw-semibold">Gender</label>
                        <select
                          name="gender"
                          className="form-select rounded-3"
                          value={patientData.gender}
                          onChange={handlePatientChange}
                          required
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label className="form-label text-secondary fw-semibold">Height (cm)</label>
                          <input
                            type="number"
                            step="0.1"
                            name="height"
                            className="form-control rounded-3"
                            value={patientData.height}
                            onChange={handlePatientChange}
                            placeholder="175"
                            required
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label text-secondary fw-semibold">Weight (kg)</label>
                          <input
                            type="number"
                            step="0.1"
                            name="weight"
                            className="form-control rounded-3"
                            value={patientData.weight}
                            onChange={handlePatientChange}
                            placeholder="70"
                            required
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    /* Doctor Fields */
                    <>
                      <div className="mb-3">
                        <label className="form-label text-secondary fw-semibold">Doctor Name</label>
                        <input
                          type="text"
                          name="doctorName"
                          className="form-control rounded-3"
                          value={doctorData.doctorName}
                          onChange={handleDoctorChange}
                          placeholder="Dr. Smith"
                          required
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label text-secondary fw-semibold">Email Address</label>
                        <input
                          type="email"
                          name="email"
                          className="form-control rounded-3"
                          value={doctorData.email}
                          onChange={handleDoctorChange}
                          placeholder="smith@hospital.com"
                          required
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label text-secondary fw-semibold">Specialization</label>
                        <input
                          type="text"
                          name="specialization"
                          className="form-control rounded-3"
                          value={doctorData.specialization}
                          onChange={handleDoctorChange}
                          placeholder="Cardiologist, Pediatrician..."
                          required
                        />
                      </div>

                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label className="form-label text-secondary fw-semibold">Phone No.</label>
                          <input
                            type="tel"
                            name="phone"
                            className="form-control rounded-3"
                            value={doctorData.phone}
                            onChange={handleDoctorChange}
                            placeholder="0987654321"
                            required
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label text-secondary fw-semibold">Experience (yrs)</label>
                          <input
                            type="number"
                            name="experience"
                            className="form-control rounded-3"
                            value={doctorData.experience}
                            onChange={handleDoctorChange}
                            placeholder="10"
                            required
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <div className="mb-4">
                    <label className="form-label text-secondary fw-semibold">Password</label>
                    <input
                      type="password"
                      name="password"
                      className="form-control rounded-3"
                      value={isPatient ? patientData.password : doctorData.password}
                      onChange={isPatient ? handlePatientChange : handleDoctorChange}
                      placeholder="••••••••"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className={`btn w-100 py-2.5 rounded-3 text-white fw-bold ${
                      isPatient ? "btn-primary" : "btn-success"
                    }`}
                  >
                    Register
                  </button>
                </form>
              )}
            </div>
            
            <div className="card-footer bg-light p-3 text-center border-0">
              <Link to="/" className="text-secondary text-decoration-none small">
                ← Back to Portal Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginRegister;
