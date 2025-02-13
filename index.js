const express = require('express');
const path = require('path');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3000;
const domain = process.env.DOMAIN || 'http://localhost';

// Serve static files
app.use(express.static(__dirname));

// Redirect users to Telegram authentication first
app.get('/', async (req, res) => {
  try {
    const response = await axios.get(`${domain}:5000/check-session`);
    if (response.data.success) {
      res.sendFile(path.join(__dirname, 'index.html'));
    } else {
      res.redirect(`${domain}:5000/login`);
    }
  } catch (error) {
    console.error('Error connecting to authentication API:', error);
    res.status(500).send('Error checking authentication.');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at ${domain}:${port}`);
});
