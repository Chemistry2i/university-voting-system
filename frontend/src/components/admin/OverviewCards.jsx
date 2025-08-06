import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,
  faCheckCircle,
  faPoll,
  faUserTie,
  faBell,
  faHistory,
  faHourglassHalf,
  faPlayCircle,
  faHeartbeat,
} from "@fortawesome/free-solid-svg-icons";

function OverviewCards({ stats }) {
  const cardClass = "col-6 col-sm-4 col-md-2";
  const iconSize = "lg";
  const titleClass = "card-title mt-1 mb-1 small";
  const valueClass = "fw-bold mb-0";

  return (
    <div className="row g-2 mb-3" style={{width: "100%"}}>
      <div className={cardClass}>
        <div className="card shadow-sm border-0">
          <div className="card-body text-center py-2 px-1">
            <FontAwesomeIcon icon={faUsers} size={iconSize} className="mb-1 text-primary" title="Total Registered Users" />
            <div className={titleClass}>Users</div>
            <div className={`${valueClass} text-primary`} style={{ fontSize: "1.1rem" }}>
              {stats?.totalUsers ?? 0}
            </div>
          </div>
        </div>
      </div>
      <div className={cardClass}>
        <div className="card shadow-sm border-0">
          <div className="card-body text-center py-2 px-1">
            <FontAwesomeIcon icon={faCheckCircle} size={iconSize} className="mb-1 text-success" title="Total Votes Cast" />
            <div className={titleClass}>Votes</div>
            <div className={`${valueClass} text-success`} style={{ fontSize: "1.1rem" }}>
              {stats?.totalVotes ?? 0}
            </div>
          </div>
        </div>
      </div>
      <div className={cardClass}>
        <div className="card shadow-sm border-0">
          <div className="card-body text-center py-2 px-1">
            <FontAwesomeIcon icon={faPoll} size={iconSize} className="mb-1 text-warning" title="Total Elections" />
            <div className={titleClass}>Elections</div>
            <div className={`${valueClass} text-warning`} style={{ fontSize: "1.1rem" }}>
              {stats?.totalElections ?? 0}
            </div>
          </div>
        </div>
      </div>
      <div className={cardClass}>
        <div className="card shadow-sm border-0">
          <div className="card-body text-center py-2 px-1">
            <FontAwesomeIcon icon={faUserTie} size={iconSize} className="mb-1 text-info" title="Total Candidates" />
            <div className={titleClass}>Candidates</div>
            <div className={`${valueClass} text-info`} style={{ fontSize: "1.1rem" }}>
              {stats?.totalCandidates ?? 0}
            </div>
          </div>
        </div>
      </div>
      <div className={cardClass}>
        <div className="card shadow-sm border-0">
          <div className="card-body text-center py-2 px-1">
            <FontAwesomeIcon icon={faPlayCircle} size={iconSize} className="mb-1 text-success" title="Active Elections" />
            <div className={titleClass}>Active Elections</div>
            <div className={`${valueClass} text-success`} style={{ fontSize: "1.1rem" }}>
              {stats?.activeElections ?? 0}
            </div>
          </div>
        </div>
      </div>
      <div className={cardClass}>
        <div className="card shadow-sm border-0">
          <div className="card-body text-center py-2 px-1">
            <FontAwesomeIcon icon={faHourglassHalf} size={iconSize} className="mb-1 text-warning" title="Pending Approvals" />
            <div className={titleClass}>Pending Approvals</div>
            <div className={`${valueClass} text-warning`} style={{ fontSize: "1.1rem" }}>
              {stats?.pendingApprovals ?? 0}
            </div>
          </div>
        </div>
      </div>
      <div className={cardClass}>
        <div className="card shadow-sm border-0">
          <div className="card-body text-center py-2 px-1">
            <FontAwesomeIcon icon={faBell} size={iconSize} className="mb-1 text-danger" title="Notifications" />
            <div className={titleClass}>Notifications</div>
            <div className={`${valueClass} text-danger`} style={{ fontSize: "1.1rem" }}>
              {stats?.totalNotifications ?? 0}
            </div>
          </div>
        </div>
      </div>
      <div className={cardClass}>
        <div className="card shadow-sm border-0">
          <div className="card-body text-center py-2 px-1">
            <FontAwesomeIcon icon={faHistory} size={iconSize} className="mb-1 text-secondary" title="System Logs" />
            <div className={titleClass}>Logs</div>
            <div className={`${valueClass} text-secondary`} style={{ fontSize: "1.1rem" }}>
              {stats?.totalLogs ?? 0}
            </div>
          </div>
        </div>
      </div>
      <div className={cardClass}>
        <div className="card shadow-sm border-0">
          <div className="card-body text-center py-2 px-1">
            <FontAwesomeIcon icon={faHeartbeat} size={iconSize} className="mb-1 text-success" title="System Health" />
            <div className={titleClass}>System Health</div>
            <div className={`${valueClass} text-success`} style={{ fontSize: "1.1rem" }}>
              {stats?.systemHealth ?? "OK"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default OverviewCards;