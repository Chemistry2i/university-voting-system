import { useEffect, useState } from "react";
import axios from "axios";
import { Line, Bar, PolarArea } from "react-chartjs-2";

function DashboardCharts() {
  const [stats, setStats] = useState({
    electionNames: [],
    votesPerElection: [],
    roles: [],
    roleCounts: [],
    participationLabels: [],
    participationData: [],
  });
  const [candidateStats, setCandidateStats] = useState({
    candidateNames: [],
    candidateVotes: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch general dashboard stats
    const fetchStats = async () => {
      try {
        const res = await axios.get("/api/admin/stats"); // Adjust this endpoint to your actual stats endpoint
        setStats(res.data);
      } catch (err) {
        setStats({
          electionNames: [],
          votesPerElection: [],
          roles: [],
          roleCounts: [],
          participationLabels: [],
          participationData: [],
        });
      }
    };

    // Fetch approved candidates and their votes
    const fetchCandidateVotes = async () => {
      try {
        const res = await axios.get("/api/candidates"); // This returns all candidates
        // Filter approved candidates and map names/votes
        const approved = res.data.filter((c) => c.status === "approved");
        setCandidateStats({
          candidateNames: approved.map((c) => c.name),
          candidateVotes: approved.map((c) => c.votes || 0),
        });
      } catch (err) {
        setCandidateStats({
          candidateNames: [],
          candidateVotes: [],
        });
      }
    };

    setLoading(true);
    Promise.all([fetchStats(), fetchCandidateVotes()]).finally(() => setLoading(false));
  }, []);

  const hasVotes = Array.isArray(stats?.electionNames) && stats.electionNames.length > 0;
  const hasRoles = Array.isArray(stats?.roles) && stats.roles.length > 0;
  const hasParticipation = Array.isArray(stats?.participationLabels) && stats.participationLabels.length > 0;
  const hasCandidateVotes =
    Array.isArray(candidateStats?.candidateNames) &&
    candidateStats.candidateNames.length > 0 &&
    Array.isArray(candidateStats?.candidateVotes);

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  return (
    <div className="row g-4">
      {/* Approved Candidates Votes Line Chart */}
      <div className="col-md-12">
        <div className="card shadow-sm border-0 p-3">
          <h5 className="mb-3">Approved Candidates Votes</h5>
          {hasCandidateVotes ? (
            <Line
              data={{
                labels: candidateStats.candidateNames,
                datasets: [
                  {
                    label: "Votes per Candidate",
                    data: candidateStats.candidateVotes,
                    borderColor: "#e11d48",
                    backgroundColor: "rgba(225,29,72,0.2)",
                    tension: 0.4,
                    fill: true,
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: { legend: { display: true } },
              }}
              aria-label="Votes per Candidate Line Chart"
            />
          ) : (
            <div className="text-muted text-center py-5">No candidate vote data available</div>
          )}
        </div>
      </div>

      {/* Votes Trend */}
      <div className="col-md-6">
        <div className="card shadow-sm border-0 p-3">
          <h5 className="mb-3">Votes Trend</h5>
          {hasVotes ? (
            <Line
              data={{
                labels: stats.electionNames,
                datasets: [
                  {
                    label: "Votes",
                    data: stats.votesPerElection,
                    borderColor: "#2563eb",
                    backgroundColor: "rgba(37,99,235,0.2)",
                    tension: 0.4,
                    fill: true,
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: { legend: { display: true } },
              }}
              aria-label="Votes Trend Line Chart"
            />
          ) : (
            <div className="text-muted text-center py-5">No vote data available</div>
          )}
        </div>
      </div>

      {/* User Roles Distribution */}
      <div className="col-md-6">
        <div className="card shadow-sm border-0 p-3">
          <h5 className="mb-3">User Roles Distribution</h5>
          {hasRoles ? (
            <Bar
              data={{
                labels: stats.roles,
                datasets: [
                  {
                    data: stats.roleCounts,
                    backgroundColor: ["#2563eb", "#22c55e", "#f59e42", "#e11d48"],
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: { legend: { display: true, position: "bottom" } },
              }}
              aria-label="User Roles Doughnut Chart"
            />
          ) : (
            <div className="text-muted text-center py-5">No role data available</div>
          )}
        </div>
      </div>

      {/* Election Participation */}
      <div className="col-md-12">
        <div className="card shadow-sm border-0 p-3">
          <h5 className="mb-3">Election Participation</h5>
          {hasParticipation ? (
            <PolarArea
              data={{
                labels: stats.participationLabels,
                datasets: [
                  {
                    data: stats.participationData,
                    backgroundColor: [
                      "#2563eb", "#22c55e", "#f59e42", "#e11d48", "#a21caf", "#0ea5e9"
                    ],
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: { legend: { display: true, position: "right" } },
              }}
              aria-label="Election Participation Polar Area Chart"
            />
          ) : (
            <div className="text-muted text-center py-5">No participation data available</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DashboardCharts;