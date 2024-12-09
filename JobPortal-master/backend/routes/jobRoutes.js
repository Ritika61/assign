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
}

);

router.post('/', authMiddleware, async (req, res) => {
  if (req.user.role !== 'company') return res.status(403).json({ message: 'Forbidden' });

  try {
    const job = await Job.create({ ...req.body, companyId: req.user.id });
    res.status(201).json(job);
  } catch (error) {
    console.error("Error creating job:", error);
    res.status(500).json({ message: 'Error creating job.' });
  }
});

router.post('/status/:aid', authMiddleware, async (req, res) => {
  
  if (req.user.role !== 'company') return res.status(403).json({ message: 'Forbidden' });
  

  try {
    console.log("Requested for..",req.params.aid,req.body.status,req.user.id)
    const application = await Application.findOne({ where: { id: req.params.aid  } });
    const isCompanySame = application.publishedBy == req.user.id;
  console.log("isCompanySame",isCompanySame)
   if(!isCompanySame) return res.status(403).json({ message: 'Forbidden for others' });

    application.status = req.body.status;
    await application.save();
    
    res.json(application);
  
  } catch (error) {
    console.error("Error creating job:", error);
    res.status(500).json({ message: 'Error creating job.' });
  }
});

//change application status
router.post('/:id', authMiddleware, async (req, res) => {
  if (req.user.role !== 'company') return res.status(403).json({ message: 'Forbidden' });

  try {
    const job = await Job.create({ ...req.body, companyId: req.user.id });
    res.status(201).json(job);
  } catch (error) {
    console.error("Error creating job:", error);
    res.status(500).json({ message: 'Error creating job.' });
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  if (req.user.role !== 'company') return res.status(403).json({ message: 'Forbidden' });

  try {
    // Check if the job exists and belongs to the requesting company
    const job = await Job.findOne({ where: { id: req.params.id, companyId: req.user.id } });
    if (!job) return res.status(404).json({ message: 'Job not found or unauthorized' });

    // Specify allowed fields for update
    const allowedUpdates = ['title', 'description', 'location', 'salary'];
    const updates = Object.keys(req.body);

    // Validate that all provided fields are allowed
    const isValidUpdate = updates.every((update) => allowedUpdates.includes(update));
    if (!isValidUpdate) return res.status(400).json({ message: 'Invalid updates' });

    // Update job with the allowed fields
    updates.forEach((update) => {
      job[update] = req.body[update];
    });

    await job.save();
    res.json(job);
  } catch (error) {
    console.error("Error updating job:", error);
    res.status(500).json({ message: 'Error updating job.' });
  }
});


// Route: Delete a job (Company only)
router.delete('/:id', authMiddleware, async (req, res) => {
  if (req.user.role !== 'company') return res.status(403).json({ message: 'Forbidden' });

  try {
    const job = await Job.findOne({ where: { id: req.params.id, companyId: req.user.id } });
    if (!job) return res.status(404).json({ message: 'Job not found' });

    await job.destroy();
    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error("Error deleting job:", error);
    res.status(500).json({ message: 'Error deleting job.' });
  }
});

// Route: Get all jobs with pagination
router.get('/', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  try {
    const { rows: jobs, count: totalJobs } = await Job.findAndCountAll({
      limit,
      offset,
    });
    res.json({
      jobs,
      currentPage: page,
      totalPages: Math.ceil(totalJobs / limit),
    });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    res.status(500).json({ message: 'Error fetching jobs.' });
  }
});



module.exports = router;
