import mongoose from 'mongoose';

const PatientSchema = new mongoose.Schema({
  walletAddress: { type: String, required: true, unique: true },
  dataHash: { type: String }, // Encrypted payload hash (IPFS CID hash or similar)
  metadataHash: { type: String }, // Encrypted metadata pointer
  consentActive: { type: Boolean, default: true },
  nftTokenId: { type: String }, // ERC-721 token ID for data vault
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model('gp_Patient', PatientSchema);
