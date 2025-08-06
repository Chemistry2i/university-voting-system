const express = require('express');
const router = express.Router();

router.get('/dashboard-stats', async (req, res) => {
  // Replace with real DB queries
  res.json({
    totalUsers: 1200,
    totalVotes: 950,
    totalElections: 5,
    totalCandidates: 20,
    electionNames: ["President", "Secretary", "Treasurer", "PRO", "Sports"],
    votesPerElection: [400, 200, 150, 120, 80],
    roles: ["admin", "student", "staff"],
    roleCounts: [3, 1100, 97],
  });
});

module.exports = router;