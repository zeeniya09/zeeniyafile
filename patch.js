//Build a URL shortening service using Express and MongoDB
// POST/shortURL-Accept a long URL  and return short URL
// GET/shortID Redirect to the orignal URL and increment access count 
// PATH/ shortID-Allow updating the long URL or access account 
const { v4: uuidv4 } = require('uuid');
const Url = require('../models/Url');

// POST /shorten — create short URL
exports.shortenUrl = async (req, res) => {
  try {
    const { originalUrl } = req.body;

    if (!originalUrl) {
      return res.status(400).json({ error: 'Please provide a URL' });
    }

    // Check if this URL was already shortened
    const existing = await Url.findOne({ originalUrl });
    if (existing) {
      return res.json({
        message: 'Already shortened',
        shortUrl: `http://localhost:3000/${existing.shortCode}`
      });
    }

    // Generate a unique short code using UUID (first 8 chars)
    const shortCode = uuidv4().split('-')[0];  // e.g. 'a3f2b1c9'

    const urlDoc = await Url.create({ originalUrl, shortCode });

    res.status(201).json({
      message:    'URL shortened successfully',
      originalUrl,
      shortCode,
      shortUrl:   `http://localhost:3000/${shortCode}`,
      clicks:     0
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /:shortCode — redirect to original URL
exports.redirectUrl = async (req, res) => {
  try {
    const { shortCode } = req.params;

    const urlDoc = await Url.findOne({ shortCode });
    if (!urlDoc) {
      return res.status(404).json({ error: 'Short URL not found' });
    }
    
    // Increment click count
    urlDoc.clicks += 1;
    await urlDoc.save();

    // 302 redirect → sends user to original URL
    res.redirect(302, urlDoc.originalUrl);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /stats/:shortCode — view click stats
exports.getStats = async (req, res) => {
  const urlDoc = await Url.findOne({ shortCode: req.params.shortCode });
  if (!urlDoc) return res.status(404).json({ error: 'Not found' });
  res.json({ originalUrl: urlDoc.originalUrl, clicks: urlDoc.clicks, createdAt: urlDoc.createdAt });
};