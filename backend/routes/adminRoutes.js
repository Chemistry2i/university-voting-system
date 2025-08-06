const express = require('express');
const router = express.Router();

const User = require('../models/User');
const Vote = require('../models/Vote');
const Election = require('../models/Election');
const Candidate = require('../models/Candidate');

router.get('/dashboard-stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalVotes = await Vote.countDocuments();
    const totalElections = await Election.countDocuments();
    const totalCandidates = await Candidate.countDocuments();

    const elections = await Election.find({}, 'name');
    const electionNames = elections.map(e => e.name);

    // Count votes per election
    const votesPerElection = await Promise.all(
      elections.map(async (e) => await Vote.countDocuments({ election: e._id }))
    );

    // User roles distribution
    const roles = ['admin', 'student', 'staff'];
    const roleCounts = await Promise.all(
      roles.map(async (role) => await User.countDocuments({ role }))
    );

    res.json({
      totalUsers,
      totalVotes,
      totalElections,
      totalCandidates,
      electionNames,
      votesPerElection,
      roles,
      roleCounts,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch dashboard stats" });
  }
});

module.exports = router;