const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const Application = require("../models/Application");
const Job = require("../models/Job");

const router = express.Router();

// Applicant: View own applications
router.get("/applicant-applications", authMiddleware, async (req, res) => {
  console.log("inside applicant-applications");
  if (req.user.role !== "applicant") {
    return res
      .status(403)
      .json({ message: "Forbidden: Access is restricted to applicants only" });
  }

  try {
    const applications = await Application.findAll({
      where: { applicantId: req.user.id },
    });
    res.json(applications);
  } catch (error) {
    console.error("Error fetching applications:", error);
    res.status(500).json({ message: "Error fetching applications." });
  }
});

// Company: View applications for jobs posted by the company
router.get("/company-applications", authMiddleware, async (req, res) => {
  console.log("inside company-applications");
  if (req.user.role !== "company") {
    return res.status(403).json({ message: "Forbidden" });
  }

  try {
    const applications = await Application.findAll({
      where: { publishedBy: req.user.id },
    });
    res.json(applications);
  } catch (error) {
    console.error("Error fetching applications:", error);
    res.status(500).json({ message: "Error fetching applications." });
  }
});

// Company: View jobs with pagination
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

// Company: Accept or reject a job application
router.post("/application/:id/status", authMiddleware, async (req, res) => {
  const { id } = req.params; // Application ID
  const { status } = req.body; // 'accepted' or 'rejected'

  if (req.user.role !== "company") {
    return res.status(403).json({ message: "Forbidden" });
  }

  if (!["accepted", "rejected"].includes(status)) {
    return res.status(400).json({ message: "Invalid status value." });
  }

  try {
    const application = await Application.findByPk(id);

    if (!application) {
      return res.status(404).json({ message: "Application not found." });
    }

    // Ensure the application belongs to a job posted by this company
    const job = await Job.findByPk(application.jobId);
    if (job.companyId !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized." });
    }

    // Update application status
    application.status = status;
    await application.save();

    res.json({ message: `Application ${status} successfully.` });
  } catch (error) {
    console.error("Error updating application status:", error);
    res.status(500).json({ message: "Error updating application status." });
  }
});

module.exports = router;
