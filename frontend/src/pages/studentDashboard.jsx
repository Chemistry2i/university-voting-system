import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import {
  FaSignOutAlt,
  FaUserCircle,
  FaVoteYea,
  FaCheckCircle,
  FaUserGraduate,
  FaEnvelope,
  FaIdBadge,
  FaPoll,
  FaUsers,
  FaChartBar,
} from "react-icons/fa";

function StudentDashboard({ user }) {
  const [elections, setElections] = useState([]);
  const [myVotes, setMyVotes] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchElections();
    fetchMyVotes();
    // eslint-disable-next-line
  }, []);

  const fetchElections = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/elections", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setElections(res.data);
    } catch (err) {
      Swal.fire("Error", "Failed to load elections", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchMyVotes = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/votes/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMyVotes(res.data);
    } catch (err) {
      // ignore if not implemented yet
    }
  };

  const handleVote = async (electionId, candidateId) => {
    // Debug log to check IDs
    console.log("Voting for:", { electionId, candidateId });
    try {
     await axios.post(
  `http://localhost:5000/api/votes`,
  { electionId: electionId, candidateId: candidateId }, // <-- use electionId and candidateId
  { headers: { Authorization: `Bearer ${token}` } }
);
      Swal.fire("Success", "Vote cast successfully!", "success");
      fetchMyVotes();
      fetchElections(); // Refresh to update vote counts
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Failed to vote", "error");
    }
  };

  // Filter only ongoing elections (status: "Open" or "Ongoing")
  const ongoingElections = elections.filter(
    (e) =>
      (e.status && (e.status.toLowerCase() === "open" || e.status.toLowerCase() === "ongoing"))
  );

  return (
    <div
      className="d-flex flex-column"
      style={{
        minHeight: "100vh",
        minWidth: "100vw",
        background: "linear-gradient(135deg, #f8fafc 0%, #e0e7ef 100%)",
        overflowX: "hidden",
      }}
    >
      <nav
        className="navbar navbar-expand-lg navbar-dark"
        style={{
          background: "linear-gradient(90deg, #2563eb 0%, #1e293b 100%)",
          boxShadow: "0 2px 8px rgba(30,41,59,0.08)",
        }}
      >
        <div className="container-fluid">
          <span className="navbar-brand d-flex align-items-center gap-2">
            <FaUserGraduate size={28} />
            <span className="fw-bold fs-4">Student Dashboard</span>
          </span>
          <button
            className="btn btn-outline-light d-flex align-items-center gap-2"
            onClick={() => {
              localStorage.removeItem("token");
              window.location.href = "/login";
            }}
          >
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </nav>

      <div className="container-fluid flex-grow-1 py-4" style={{ maxWidth: 1400 }}>
        <div className="row g-4">
          {/* Profile Card */}
          <div className="col-lg-3 col-md-4">
            <div className="card shadow border-0 mb-4" style={{ borderRadius: 5 }}>
              <div className="card-body text-center p-4">
                <FaUserCircle size={70} className="mb-3 text-primary" />
                <h5 className="fw-bold mb-1">{user?.name}</h5>
                <div className="text-muted mb-2">
                  <FaEnvelope className="me-1" /> {user?.email}
                </div>
                <div className="mb-2">
                  <FaIdBadge className="me-1" /> <span className="text-secondary">ID:</span> {user?.studentId || user?._id}
                </div>
                <div>
                  <span className="badge bg-primary">
                    <FaUserGraduate className="me-1" /> {user?.role}
                  </span>
                </div>
              </div>
            </div>
            {/* My Votes */}
            <div className="card shadow border-0" style={{ borderRadius: 5 }}>
              <div
                className="card-header bg-success text-white d-flex align-items-center gap-2"
                style={{ borderTopLeftRadius: 5, borderTopRightRadius: 5 }}
              >
                <FaVoteYea /> <span>My Votes</span>
              </div>
              <div className="card-body">
                {myVotes.length === 0 ? (
                  <div className="text-muted">You have not voted yet.</div>
                ) : (
                  <ul className="list-group list-group-flush">
                    {myVotes.map((vote) => (
                      <li className="list-group-item d-flex align-items-center" key={vote._id}>
                        <FaPoll className="me-2 text-primary" />
                        <span className="fw-semibold">{vote.electionTitle || vote.election}</span>
                        <span className="ms-auto">
                          <span className="badge bg-primary">
                            {vote.candidateName || vote.candidate}
                          </span>
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          {/* Elections */}
          <div className="col-lg-9 col-md-8">
            <div className="card shadow border-0" style={{ borderRadius: 5 }}>
              <div
                className="card-header bg-primary text-white d-flex align-items-center gap-2"
                style={{ borderTopLeftRadius: 5, borderTopRightRadius: 5 }}
              >
                <FaPoll /> <span>Ongoing Elections</span>
              </div>
              <div className="card-body" style={{ minHeight: 350 }}>
                {loading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status"></div>
                  </div>
                ) : ongoingElections.length === 0 ? (
                  <div className="text-muted text-center py-5">No ongoing elections at the moment.</div>
                ) : (
                  ongoingElections.map((election) => {
                    // Only show approved candidates
                    const approvedCandidates = (election.candidates || []).filter(
                      (c) => c.status === "approved"
                    );
                    const voted = myVotes.some((v) => v.election === (election._id || election.id));

                    return (
                      <div key={election._id || election.id} className="mb-4 pb-3 border-bottom">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <h5 className="fw-bold mb-0">{election.title || election.name}</h5>
                          <span className="badge bg-info">
                            <FaChartBar className="me-1" />
                            {election.status || "Ongoing"}
                          </span>
                        </div>
                        <div className="mb-2 text-muted">{election.description}</div>
                        <div>
                          <strong>
                            <FaUsers className="me-1" />
                            Candidates:
                          </strong>
                          <div className="row g-2 mt-1">
                            {approvedCandidates.length > 0 ? (
                              approvedCandidates.map((candidate) => (
                                <div className="col-md-6 col-lg-4" key={candidate._id || candidate.id}>
                                  <div
                                    className="card card-body p-2 d-flex flex-row align-items-center shadow-sm"
                                    style={{ borderRadius: 12 }}
                                  >
                                    <img
                                      src={candidate.photo || "/default-avatar.png"}
                                      alt={candidate.name}
                                      style={{
                                        width: 40,
                                        height: 40,
                                        objectFit: "cover",
                                        borderRadius: "50%",
                                        marginRight: 12,
                                        border: "2px solid #2563eb",
                                      }}
                                    />
                                    <div className="flex-grow-1">
                                      <div className="fw-semibold">{candidate.name}</div>
                                      <div className="text-muted small">{candidate.party || "-"}</div>
                                      {/* Show vote count if available */}
                                      {typeof candidate.votes === "number" && (
                                        <div className="small text-success">
                                          Votes: {candidate.votes}
                                        </div>
                                      )}
                                    </div>
                                    {voted ? (
                                      <span className="badge bg-success ms-2 d-flex align-items-center gap-1">
                                        <FaCheckCircle /> Voted
                                      </span>
                                    ) : (
                                      <button
                                        className="btn btn-sm btn-outline-primary ms-2 d-flex align-items-center gap-1"
                                        onClick={() =>
                                          handleVote(
                                            election._id || election.id,
                                            candidate._id || candidate.id
                                          )
                                        }
                                      >
                                        <FaVoteYea /> Vote
                                      </button>
                                    )}
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="col-12 text-muted">No approved candidates yet.</div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;