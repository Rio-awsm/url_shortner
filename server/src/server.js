import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { nanoid } from 'nanoid';
import dotenv from 'dotenv';
import QRCode from 'qrcode';

dotenv.config();

const app = express();


app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const UrlSchema = new mongoose.Schema({
  originalUrl: String,
  shortUrl: String,
});

const Url = mongoose.model('Url', UrlSchema);

app.post('/api/shorten', async (req, res) => {
  const { originalUrl } = req.body;
  const shortUrl = nanoid(3); 

  const url = new Url({
    originalUrl,
    shortUrl,
  });

  await url.save();

 
  const fullShortUrl = `${process.env.BASE_URL || 'https://url-shortner-2kza.onrender.com'}/${shortUrl}`;
  const qrCode = await QRCode.toDataURL(fullShortUrl);

  res.json({ shortUrl, qrCode });
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));