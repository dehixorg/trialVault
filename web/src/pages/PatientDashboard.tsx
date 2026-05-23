import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Upload, Key, CheckCircle, Wallet } from 'lucide-react';

export default function PatientDashboard() {
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [encryptedData, setEncryptedData] = useState<any>(null);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');

  const connectWallet = () => {
    setWalletConnected(true);
    setWalletAddress('0x4F9...b1A2');
  };

  const handleUpload = () => {
    if (!walletConnected) return;
    setIsEncrypting(true);
    setTimeout(() => {
      setEncryptedData({
        cid: 'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi',
        tokenId: '104',
        timestamp: new Date().toLocaleTimeString()
      });
      setIsEncrypting(false);
    }, 2500);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="animate-fade-in"
    >
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h2 className="mb-2">Patient <span className="text-gradient">Data Vault</span></h2>
          <p className="mb-0">Self-custody your health data with client-side FHE encryption.</p>
        </div>
        {!walletConnected ? (
          <button className="btn-secondary" onClick={connectWallet}>
            <Wallet size={18} /> Connect Wallet
          </button>
        ) : (
          <div className="px-4 py-2 bg-success bg-opacity-10 text-success border border-success border-opacity-20 rounded-lg flex items-center gap-2 text-sm font-mono">
            <div className="w-2 h-2 rounded-full bg-success"></div>
            {walletAddress}
          </div>
        )}
      </header>

      <div className="flex gap-8">
        <div className="flex-1">
          <div className={`glass-card mb-8 transition-opacity duration-300 ${!walletConnected ? 'opacity-50 pointer-events-none' : ''}`}>
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-accent-primary rounded-full bg-opacity-20">
                <Upload className="text-accent-primary" />
              </div>
              <div>
                <h3 className="mb-0">Upload Medical Records</h3>
                <p className="text-sm mb-0">Powered by <code>fhenix.js</code> client-side encryption.</p>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Diagnosis Code (ICD-10)</label>
              <input type="text" className="form-input" placeholder="e.g., J45.909" />
            </div>
            
            <div className="flex gap-4">
              <div className="form-group flex-1">
                <label className="form-label">Age</label>
                <input type="number" className="form-input" placeholder="e.g., 34" />
              </div>
              <div className="form-group flex-1">
                <label className="form-label">Lab Value (Hemoglobin)</label>
                <input type="number" className="form-input" placeholder="e.g., 14.2" />
              </div>
            </div>

            {isEncrypting && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 p-4 bg-bg-tertiary rounded-lg border border-border-color mb-4"
              >
                <div className="text-xs text-text-secondary mb-2">Executing Local Encryption:</div>
                <pre className="text-[10px] text-accent-primary font-mono bg-bg-secondary p-2 rounded">
                  {`const client = new FhenixClient({ provider });
const encAge = await client.encrypt_uint32(34);
const encLab = await client.encrypt_uint32(142);
// Generating Zero-Knowledge Proofs for ciphertext...`}
                </pre>
              </motion.div>
            )}

            <button 
              className="btn-primary w-full justify-center mt-4" 
              onClick={handleUpload}
              disabled={isEncrypting || encryptedData !== null || !walletConnected}
            >
              {isEncrypting ? (
                <span>Generating Ciphertext...</span>
              ) : (
                <>
                  <Shield size={18} />
                  Encrypt & Store in Vault
                </>
              )}
            </button>
          </div>

          {encryptedData && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card border border-success"
            >
              <div className="flex items-center gap-2 mb-4 text-success">
                <CheckCircle />
                <h3 className="mb-0">Data Secured Successfully</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-bg-tertiary rounded-lg">
                  <span className="text-xs text-text-secondary block mb-1">IPFS CID</span>
                  <span className="font-mono text-sm break-all">{encryptedData.cid}</span>
                </div>
                <div className="p-4 bg-bg-tertiary rounded-lg">
                  <span className="text-xs text-text-secondary block mb-1">Vault NFT Token ID</span>
                  <span className="font-mono text-sm">{encryptedData.tokenId}</span>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        <div className="w-[350px]">
          <div className="glass-card h-full">
            <h3 className="flex items-center gap-2 mb-6">
              <Key size={20} className="text-accent-secondary" />
              Vault Status
            </h3>
            
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-border-color pb-4">
                <span className="text-text-secondary">Encryption Status</span>
                <span className="text-success font-medium flex items-center gap-1">
                  <Shield size={14} /> Active
                </span>
              </div>
              
              <div className="flex justify-between items-center border-b border-border-color pb-4">
                <span className="text-text-secondary">Stored Records</span>
                <span className="font-mono font-medium">{encryptedData ? '1' : '0'}</span>
              </div>
              
              <div className="flex justify-between items-center pb-4">
                <span className="text-text-secondary">Active Licenses</span>
                <span className="font-mono font-medium">0</span>
              </div>
            </div>

            <div className="mt-8 p-4 bg-bg-tertiary rounded-lg border border-border-color">
              <h4 className="text-sm text-text-secondary mb-2">Network Security</h4>
              <p className="text-xs mb-0">
                Your data is protected by Fully Homomorphic Encryption. TrialVault never sees your plaintext data.
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
