import mongoose from 'mongoose';

const TrialSchema = new mongoose.Schema({
  sponsorAddress: { type: String, required: true },
  trialName: { type: String, required: true },
  phase: { type: String, default: "Phase II" },
  protocolNumber: { type: String, default: "TV-001" },
  description: { type: String },
  expectedParticipants: { type: Number, default: 100 },
  targetCondition: { type: String },
  minAge: { type: Number },
  maxBp: { type: Number },
  criteriaHash: { type: String }, // Encrypted FHE criteria hash
  fulfilled: { type: Boolean, default: false },
  cohortCount: { type: Number, default: 0 },
  fheProofHash: { type: String },
  trialIdOnChain: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('tv_Trial', TrialSchema);
