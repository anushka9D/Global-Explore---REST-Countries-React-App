const express = require('express');
const dotenv = require('dotenv').config();
const dbConnect = require('./config/dbConnect.js');
const app = express();
const authRoutes = require('./routes/authRoutes.js');
const cors = require('cors');

app.use(cors());

//Middleware
app.use(express.json());

//Database Connection
dbConnect();

//Routes
app.use('/api/auth', authRoutes);

// Start server 
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});