import mongoose from 'mongoose';

const certificateSchema = new mongoose.Schema({
  domain: String,
  validFrom: Date,
  validTo: Date,
  issuer: String,
  status: String,
});

export default mongoose.model('Certificate', certificateSchema);