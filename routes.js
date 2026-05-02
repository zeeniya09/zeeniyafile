const express = require('express');
const router  = express.Router();
const { shortenUrl, redirectUrl, getStats } = require('../controllers/urlController');

router.post('/shorten',        shortenUrl);   // Create short URL
router.get('/stats/:shortCode', getStats);    // View click stats
router.get('/:shortCode',      redirectUrl);  // Redirect (keep this LAST)

module.exports = router;

// app.js
require('dotenv').config();
const express  = require('express');
const mongoose = require('mongoose');
const app      = express();

app.use(express.json());
app.use('/', require('./routes/urlRoutes'));

mongoose.connect(process.env.MONGO_URI)
  .then(() => app.listen(3000, () => console.log('URL Shortener running on 3000')))
  .catch(console.error);