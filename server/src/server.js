import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { nanoid } from 'nanoid';
import dotenv from 'dotenv';
import QRCode from 'qrcode';
import metascraper from 'metascraper';
import metascraperTitle from 'metascraper-title';
import metascraperDescription from 'metascraper-description';
import metascraperImage from 'metascraper-image';
import got from 'got';
import seoRoutes from './routes/seo.js';
import apiRoutes from './routes/api.js';

dotenv.config();

const app = express();


app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Create a URL model
const UrlSchema = new mongoose.Schema({
  originalUrl: String,
  shortUrl: String,
  metadata: {
    title: String,
    description: String,
    image: String,
  },
});

const Url = mongoose.model('Url', UrlSchema);

// Initialize metascraper
const scraper = metascraper([
  metascraperTitle(),
  metascraperDescription(),
  metascraperImage(),
]);

// API routes
app.post('/api/shorten', async (req, res) => {
  const { originalUrl } = req.body;
  const shortUrl = nanoid(4); 

  try {
    // Fetch metadata
    const { body: html, url: fetchedUrl } = await got(originalUrl);
    const metadata = await scraper({ html, url: fetchedUrl });

    const urlEntry = new Url({
      originalUrl,
      shortUrl,
      metadata,
    });

    await urlEntry.save();

    // Generate QR code
    const fullShortUrl = `${process.env.BASE_URL || 'https://url-shortner-2kza.onrender.com'}/${shortUrl}`;
    const qrCode = await QRCode.toDataURL(fullShortUrl);

    res.json({ shortUrl, qrCode, metadata });
  } catch (error) {
    console.error('Error processing URL:', error);
    res.status(500).json({ error: 'Failed to process URL' });
  }
});

app.get('/api/metadata/:shortUrl', async (req, res) => {
  const { shortUrl } = req.params;
  const url = await Url.findOne({ shortUrl });

  if (url) {
    res.json(url.metadata);
  } else {
    res.status(404).json({ error: 'URL not found' });
  }
});

app.get('/:shortUrl', async (req, res) => {
  const { shortUrl } = req.params;
  const url = await Url.findOne({ shortUrl });

  if (url) {
    res.redirect(url.originalUrl);
  } else {
    res.status(404).json('Not found');
  }
});

app.use('/api/seo', seoRoutes);
app.use('/api', apiRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));