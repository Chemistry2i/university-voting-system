import { useEffect, useState } from "react";
import { useNavigate, Routes, Route } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import Sidebar from "../components/admin/Slidebar";
import OverviewCards from "../components/admin/OverviewCards";
import DashboardCharts from "../components/admin/DashboardCharts";
import CreateElection from "../components/admin/CreateElection";
import Candidates from "../pages/Candidates"; // Import your Candidates page

function AdminDashboard({ user }) {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateElection, setShowCreateElection] = useState(false);

  useEffect(() => {
    let interval;
    async function fetchStats() {
      try {
        const res = await axios.get("http://localhost:5000/api/admin/dashboard-stats", {
          headers: { Authorization: `Bearer ${user?.token}` },
        });
        setStats(res.data);
      } catch (err) {
        Swal.fire("Error", "Failed to load dashboard stats", "error");
      } finally {
        setLoading(false);
      }
    }
    if (user?.role === "admin") {
      fetchStats();
      interval = setInterval(fetchStats, 30000); // fetch every 30 seconds
    } else {
      navigate("/login");
    }
    return () => clearInterval(interval);
  }, [user, navigate]);

  if (loading)
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "100vh", width: "100vw", background: "#f3f4f6" }}
      >
        <div className="text-center">Loading dashboard...</div>
      </div>
    );

  return (
    <div className="container-fluid bg-light min-vh-100" style={{ width: "100vw", backgroundColor: "#000000" }}>
      <div className="row">
        <Sidebar
          user={user}
          navigate={navigate}
          onOpenCreateElection={() => setShowCreateElection(true)}
        />
        <div className="col-md-10 p-4">
          <Routes>
            <Route
              path="/"
              element={
                <>
                  <h2 className="mb-4 fw-bold">System Overview</h2>
                  <OverviewCards stats={stats} />
                  <DashboardCharts stats={stats} />
                  {/* Modal for Create Election */}
                  {showCreateElection && (
                    <div className="modal show d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.5)" }}>
                      <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                          <div className="modal-header">
                            <h5 className="modal-title">Create New Election</h5>
                            <button type="button" className="btn-close" onClick={() => setShowCreateElection(false)}></button>
                          </div>
                          <div className="modal-body">
                            <CreateElection
                              onCreated={() => {
                                setShowCreateElection(false);
                                window.location.reload();
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              }
            />
            <Route path="candidates" element={<Candidates user={user} />} />
            {/* Add more admin routes here */}
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;