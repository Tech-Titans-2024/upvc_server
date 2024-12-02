// server/server.js
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Example route
app.get('/api', (req, res) => {
  res.json({ message: "Hello from backend!" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
