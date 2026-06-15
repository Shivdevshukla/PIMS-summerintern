const express = require('express');
const cors = require('cors');
const path = require('path');

require('dotenv').config();

const authRoutes         = require('./routes/auth');
const entryRoutes        = require('./routes/entries');
const approvalRoutes     = require('./routes/approvals');
const dashboardRoutes    = require('./routes/dashboard');
const workerRoutes       = require('./routes/workers');
const exportRoutes       = require('./routes/export');
const userRoutes         = require('./routes/users');
const notificationRoutes = require('./routes/notifications');
const auditRoutes        = require('./routes/audit');
const profileRoutes      = require('./routes/profile'); // NEW

const app = express();

app.use(cors());
app.use(express.json());

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // NEW

app.use('/api/auth',          authRoutes);
app.use('/api/entries',       entryRoutes);
app.use('/api/approvals',     approvalRoutes);
app.use('/api/dashboard',     dashboardRoutes);
app.use('/api/workers',       workerRoutes);
app.use('/api/export',        exportRoutes);
app.use('/api/users',         userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/audit',         auditRoutes);
app.use('/api/profile',       profileRoutes); // NEW

app.get('/', (req, res) => res.send('PIMS Backend Running...'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));