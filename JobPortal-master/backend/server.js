// server.js
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');  // Import dashboardRoutes
const jobRoutes = require('./routes/jobRoutes');
const appRoutes = require('./routes/appRoutes');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 8000;

app.use(cors({ origin: 'http://localhost:3003' }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);  // Register the dashboard routes with prefix
app.use('/api/jobs', jobRoutes); 
app.use('/api/applicants',appRoutes)


sequelize.sync().then(() => {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
});
