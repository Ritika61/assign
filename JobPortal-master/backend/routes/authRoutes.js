const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();
const Job = require('../models/Job');

router.post('/register', async (req, res) => {
    const { name, email, password, role } = req.body;
    console.log("Registered Successfully",name,email,password,role)
  
    // Check if role is valid
    if (!['applicant', 'company'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role selected' });
    }
  
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await User.create({ name, email, password: hashedPassword, role });
     // console.log("UserCreated",user)
      res.status(201).json(user);
    } catch (error) {
      console.error("Error registering user:", error);
      res.status(500).json({ message: 'Error registering user.' });
    }
  });

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password)))
    return res.status(401).send('Invalid credentials');

  const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET); 
  console.log("Backend Login",{ token: token , role: user.role })
  res.json({ token: token , role: user.role });
});

module.exports = router;
