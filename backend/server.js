const express = require('express');
const cors = require('cors');

require('dotenv').config();

const authRoutes = require('./routes/auth');
const entryRoutes = require('./routes/entries');
const approvalRoutes = require('./routes/approvals');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/entries', entryRoutes);
app.use('/api/approvals', approvalRoutes);

app.get('/', (req, res) => {
  res.send('PIMS Backend Running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});