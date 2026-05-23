import mongoose from 'mongoose';

const LicenseSchema = new mongoose.Schema({
  patientAddress: { type: String, required: true },
  licenseeAddress: { type: String, required: true },
  royaltyBps: { type: Number, required: true },
  keyFragmentHash: { type: String, required: true },
  active: { type: Boolean, default: true },
  licenseIdOnChain: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('gp_License', LicenseSchema);
