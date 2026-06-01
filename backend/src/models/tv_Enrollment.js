import mongoose from 'mongoose';

const EnrollmentSchema = new mongoose.Schema({
  walletAddress: { type: String, required: true },
  trialId: { type: String, required: true },
  trialName: { type: String },
  encryptedVitalsCid: { type: String, required: true },
  verified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('tv_Enrollment', EnrollmentSchema);
