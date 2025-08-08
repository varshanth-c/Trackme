const express = require('express');
const cors = require('cors');
const db = require('./config/db');
require('dotenv').config();
const auth = require('./auth/Authentification');
const budgetRoutes = require('./routes/budgets');
const aiRoutes = require('./routes/aiRoutes'); 
const notificationRoutes = require('./routes/notificationRoutes');
const transactionRoutes = require('./routes/transactions'); 
const userRoutes = require('./routes/userRoutes');
const app = express();
app.use(cors());
app.use(express.json());
app.get('/', (req, res) => {
  res.send('Smart Vendor API is running 🚀');
});

app.use('/api/auth',auth);
app.use('/api/transactions', transactionRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/ai', aiRoutes); // <-- ADD THIS
app.use('/api/notifications', notificationRoutes);
app.use('/api/users', userRoutes);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`📡 Server listening on port ${PORT}`);
});
