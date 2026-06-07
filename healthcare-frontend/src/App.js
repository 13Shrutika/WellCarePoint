import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import PatientDashboard from "./pages/PatientDashboard";
import DoctorDashboard from "./pages/DoctorDashboard";
import AdminDashboard from "./pages/AdminDashboard";

function Home() {
  const handleScrollTo = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-vh-100 bg-light d-flex flex-column">
      
      {/* Navigation Bar */}
      <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm sticky-top">
        <div className="container">
          <span className="navbar-brand fw-bold fs-3 text-primary" style={{ cursor: "pointer" }} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            🏥 WellCarePoint
          </span>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
            <ul className="navbar-nav gap-2">
              <li className="nav-item">
                <button className="nav-link btn border-0 bg-transparent fw-semibold text-dark" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
                  Home
                </button>
              </li>
              <li className="nav-item">
                <button className="nav-link btn border-0 bg-transparent fw-semibold text-secondary" onClick={() => handleScrollTo("about-us")}>
                  About Us
                </button>
              </li>
              <li className="nav-item">
                <button className="nav-link btn border-0 bg-transparent fw-semibold text-secondary" onClick={() => handleScrollTo("portal-sections")}>
                  Portals
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Hero / Information Section */}
      <div className="py-5 bg-white">
        <div className="container">
          <div className="row align-items-center g-5">
            
            {/* Left Column: Info Text */}
            <div className="col-lg-6">
              <span className="badge bg-primary-subtle text-primary rounded-pill px-3 py-2 fw-semibold mb-3">
                Smart Clinical Care
              </span>
              <h1 className="display-4 fw-extrabold text-dark mb-3">
                Welcome to <span className="text-primary">WellCarePoint</span>
              </h1>
              <p className="lead text-secondary mb-4">
                Connecting patients and medical professionals seamlessly. Manage schedules, customize time slots, check progress analytics, and view consultation histories in one unified platform.
              </p>
              
              {/* Feature Bullet Points */}
              <div className="row g-3">
                <div className="col-sm-6">
                  <div className="d-flex align-items-center">
                    <span className="text-primary fs-4 me-2">✔</span>
                    <span className="fw-semibold text-secondary">Slot-Based Booking</span>
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="d-flex align-items-center">
                    <span className="text-primary fs-4 me-2">✔</span>
                    <span className="fw-semibold text-secondary">Real-Time Slot Checks</span>
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="d-flex align-items-center">
                    <span className="text-primary fs-4 me-2">✔</span>
                    <span className="fw-semibold text-secondary">Health Analytics Charts</span>
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="d-flex align-items-center">
                    <span className="text-primary fs-4 me-2">✔</span>
                    <span className="fw-semibold text-secondary">Dynamic Vitals Update</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Image */}
            <div className="col-lg-6 text-center">
              <img
                src="/wellcarepoint_hero.png"
                alt="WellCarePoint Healthcare"
                className="img-fluid rounded-4 shadow-lg border border-light-subtle"
                style={{ maxHeight: "380px", objectFit: "cover" }}
              />
            </div>

          </div>
        </div>
      </div>

      {/* About Us Section */}
      <div id="about-us" className="py-5 bg-light-subtle border-top border-bottom">
        <div className="container">
          <div className="text-center mb-5 col-md-8 mx-auto">
            <h2 className="fw-bold text-dark">About WellCarePoint</h2>
            <p className="text-secondary mt-3">
              WellCarePoint is a digital healthcare bridge designed to optimize patient consultations and doctor productivity. By integrating visual diagnostics tracking, custom scheduling slots, and patient health profiles, we enable a superior clinical care experience.
            </p>
          </div>

          <div className="row justify-content-center g-4">
            
            <div className="col-md-4">
              <div className="card h-100 border-0 bg-white shadow-sm rounded-4 p-3">
                <div className="card-body">
                  <span className="fs-2 text-primary d-block mb-3">🛡️</span>
                  <h5 className="fw-bold text-dark">Patient Empowerment</h5>
                  <p className="card-text text-secondary small">
                    Allowing patients to securely maintain profiles, edit vitals, view professional medical histories, and check wellness recommendations.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card h-100 border-0 bg-white shadow-sm rounded-4 p-3">
                <div className="card-body">
                  <span className="fs-2 text-success d-block mb-3">📈</span>
                  <h5 className="fw-bold text-dark">Progress Trends</h5>
                  <p className="card-text text-secondary small">
                    Instantly generating custom SVG line charts to map clinical changes in weights, BP, and heart rates across repeat consult visits.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card h-100 border-0 bg-white shadow-sm rounded-4 p-3">
                <div className="card-body">
                  <span className="fs-2 text-info d-block mb-3">👨‍⚕️</span>
                  <h5 className="fw-bold text-dark">Schedule Precision</h5>
                  <p className="card-text text-secondary small">
                    Providing specialists with clear daily and tomorrow's checkup schedules, accept/reject toggles, and direct medical prescription recording.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Portals Section */}
      <div id="portal-sections" className="py-5 bg-light flex-grow-1">
        <div className="container">
          
          <div className="text-center mb-4">
            <h2 className="fw-bold text-dark">Access Our Portals</h2>
            <p className="text-secondary small">Select your profile role below to proceed to login or registration.</p>
          </div>

          <div className="row justify-content-center g-4">
            
            {/* Patient Card */}
            <div className="col-md-5 col-lg-4">
              <div className="card h-100 shadow border-0 rounded-4 transition-transform hover-scale">
                <div className="card-body p-4 text-center d-flex flex-column justify-content-between">
                  <div>
                    <div className="bg-primary-subtle text-primary rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: "60px", height: "60px" }}>
                      <span className="fs-3">👤</span>
                    </div>
                    <h3 className="card-title fw-bold text-dark mb-2">Patient Portal</h3>
                    <p className="card-text text-secondary small px-2">
                      Book appointments instantly, select custom time slots, check medical history, view wellness tips, and track your clinical health trends.
                    </p>
                  </div>
                  <div className="mt-4">
                    <Link to="/patient" className="btn btn-primary w-100 py-2.5 rounded-pill fw-bold shadow-sm">
                      Enter Patient Portal
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Doctor Card */}
            <div className="col-md-5 col-lg-4">
              <div className="card h-100 shadow border-0 rounded-4 transition-transform hover-scale">
                <div className="card-body p-4 text-center d-flex flex-column justify-content-between">
                  <div>
                    <div className="bg-success-subtle text-success rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: "60px", height: "60px" }}>
                      <span className="fs-3">👨‍⚕️</span>
                    </div>
                    <h3 className="card-title fw-bold text-dark mb-2">Doctor Portal</h3>
                    <p className="card-text text-secondary small px-2">
                      Review your schedules for today or tomorrow, accept or reject incoming bookings, record patient checkups, and analyze repeat patient progress history.
                    </p>
                  </div>
                  <div className="mt-4">
                    <Link to="/doctor" className="btn btn-success w-100 py-2.5 rounded-pill fw-bold shadow-sm text-white">
                      Enter Doctor Portal
                    </Link>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-4 bg-white border-top text-muted small mt-auto">
        © {new Date().getFullYear()} WellCarePoint Healthcare Management System. Designed for learning.
      </footer>

    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/patient" element={<PatientDashboard />} />
        <Route path="/doctor" element={<DoctorDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;