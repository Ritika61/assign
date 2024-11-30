// routes/dashboardRoutes.js
const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const Application = require("../models/Application");
const Job = require("../models/Job");

const router = express.Router();

router.get("/applicant-applications", authMiddleware, async (req, res) => {
  console.log("inside applicant-applications");
  if (req.user.role !== "applicant") {
    return res
      .status(403)
      .json({ message: "Forbidden: Access is restricted to applicants only" });
  }

  try {
    const applications = await Application.findAll({
      where: { id: req.user.id },
    });
    res.json(applications);
  } catch (error) {
    console.error("Error fetching applications:", error);
    res.status(500).json({ message: "Error fetching applications." });
  }
});

router.get("/company-applications", authMiddleware, async (req, res) => {
  console.log("inside company-applications");
  if (req.user.role !== "company") {
    return res.status(403).json({ message: "Forbidden" });
  }

  try {
    const applications = await Application.findAll({ where: { publishedBy: req.user.id } });
    res.json(applications);
  } catch (error) {
    console.error("Error fetching applications:", error);
    res.status(500).json({ message: "Error fetching applications." });
  }
});

// Route: Get jobs posted by the company with pagination
router.get("/company-jobs", authMiddleware, async (req, res) => {
  console.log("inside company-jobs");
  if (req.user.role !== "company") {
    return res.status(403).json({ message: "Forbidden" });
  }

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const offset = (page - 1) * limit;

  try {
    const { rows: jobs, count: totalJobs } = await Job.findAndCountAll({
      where: { companyId: req.user.id },
      limit,
      offset,
    });

    res.json({
      jobs,
      currentPage: page,
      totalPages: Math.ceil(totalJobs / limit),
      totalJobs,
    });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    res.status(500).json({ message: "Error fetching jobs." });
  }
});

module.exports = router;