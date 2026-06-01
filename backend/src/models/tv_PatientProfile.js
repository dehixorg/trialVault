import mongoose from 'mongoose';

const PatientProfileSchema = new mongoose.Schema({
  walletAddress: { type: String, required: true, unique: true },
  age: { type: Number },
  baselineBp: { type: String },
  heartRate: { type: String },
  currentDose: { type: String },
  isVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model('tv_PatientProfile', PatientProfileSchema);
