// routes/jobRoutes.js
const express = require('express')
const Job = require('../models/Job')
const Application = require('../models/Application')
const authMiddleware = require('../middleware/authMiddleware')

const router = express.Router()

// Route: Get all jobs with pagination
router.get('/allJobs', authMiddleware, async (req, res) => {
  console.log('Inside All Jobs', req.user)
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 10
  const offset = (page - 1) * limit

  try {
    const { rows: jobs, count: totalJobs } = await Job.findAndCountAll({
      limit,
      offset
    })
    res.json({
      jobs,
      currentPage: page,
      totalPages: Math.ceil(totalJobs / limit)
    })
  } catch (error) {
    console.error('Error fetching jobs:', error)
    res.status(500).json({ message: 'Error fetching jobs.' })
  }
})

//getApplied Applications
router.get('/appliedApplications', authMiddleware, async (req, res) => {
  console.log('Inside Applied Applications')
  if (req.user.role !== 'applicant') {
    return res
      .status(403)
      .json({ message: 'Forbidden: Access is restricted to applicants only' })
  }

  try {
    const applications = await Application.findAll({
      where: { applicantId: req.user.id }
    })
    res.json(applications)
  } catch (error) {
    console.error('Error fetching applications:', error)
    res.status(500).json({ message: 'Error fetching applications.' })
  }
})

//applyJob
router.post('/applyJob', authMiddleware, async (req, res) => {
  console.log('Inside Apply Job', req.user, req.body)
  if (req.user.role !== 'applicant') {
    return res.status(403).json({ message: 'Forbidden' })
  }

  try {
    const application = await Application.create({
      applicantId: req.user.id,
      jobTitle: req.body.title,
      status: req.body.status,
      publishedBy: req.body.publishedBy
      
    })
    console.log('Application created:', application)
    res.json(application)
  } catch (error) {
    console.error('Error applying for job:', error)
    res.status(500).json({ message: 'Error applying for job.' })
  }
})

module.exports = router;
