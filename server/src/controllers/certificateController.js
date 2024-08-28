import Certificate from '../models/Certificate.js';
import { checkSSL } from '../services/sslChecker.js';

export const checkAndSaveSSL = async (req, res) => {
  const { domain } = req.body;
  
  try {
    const certInfo = await checkSSL(domain);
    const certificate = new Certificate(certInfo);
    await certificate.save();
    res.json(certInfo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};