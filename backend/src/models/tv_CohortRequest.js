import mongoose from 'mongoose';

const CohortRequestSchema = new mongoose.Schema({
  criteriaHash: { type: String, required: true },
  condition: { type: String, required: true },
  minAge: { type: Number, required: true },
  maxAge: { type: Number, required: true },
  requester: { type: String },
  encryptedPayload: { type: mongoose.Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('tv_CohortRequest', CohortRequestSchema);

