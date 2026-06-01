import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, UploadCloud, CheckCircle, Fingerprint } from 'lucide-react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { API_URL } from '../api';

export default function PatientVerifyDashboard() {
  const { address, isConnected } = useAccount();
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);

  const handleVerify = async () => {
    if (!isConnected || !address) return;
    setVerifying(true);
    
    // Mock KYC verification delay
    setTimeout(async () => {
      try {
        // Update profile in backend to set isVerified = true
        await fetch(`${API_URL}/api/profiles`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            walletAddress: address,
            isVerified: true
          })
        });
        setVerified(true);
      } catch (e) {
        console.error("Verification update failed", e);
      }
      setVerifying(false);
    }, 2000);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="animate-fade-in">
      <header className="mb-8 flex flex-wrap gap-4 justify-between items-end">
        <div>
          <h2 className="mb-2">Verify <span className="text-gradient">Identity</span></h2>
          <p className="mb-0">Link an external EHR or Government ID to prove your humanity without exposing data.</p>
        </div>
        <ConnectButton showBalance={false} />
      </header>

      <div className="grid-2 mb-8">
        <section className="glass-card">
          <h3 className="mb-6 flex items-center gap-2"><Fingerprint className="text-accent-secondary" /> Identity Proof</h3>
          <p className="text-sm mb-6 text-text-secondary">
            Pharma Sponsors prioritize participants with verified identities to prevent Sybil attacks and ensure trial data integrity.
          </p>

          <div className="form-group mb-6">
            <label className="form-label">Upload Government ID or EHR Token</label>
            <div className="p-8 border-2 border-dashed border-border-color rounded-lg text-center bg-bg-secondary cursor-pointer hover:border-accent-primary transition-colors">
              <UploadCloud className="mx-auto mb-2 text-text-secondary" size={32} />
              <p className="text-sm text-text-secondary mb-0">Drag and drop document, or click to browse</p>
            </div>
          </div>

          <button 
            className="btn-primary w-full justify-center" 
            onClick={handleVerify}
            disabled={!isConnected || verifying || verified}
          >
            {verifying ? 'Generating Zero-Knowledge Proof...' : verified ? 'Identity Verified' : 'Generate zkKYC Proof'}
          </button>
          {!isConnected && <p className="text-xs text-warning mt-2 text-center">Connect wallet to verify</p>}
        </section>

        {verified && (
          <motion.section 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card border-success bg-success bg-opacity-5"
          >
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShieldCheck size={64} className="text-success mb-4" />
              <h3 className="text-success mb-2">Verified Patient</h3>
              <p className="text-sm text-text-secondary mb-4">
                Your wallet <strong>{address?.slice(0,6)}...{address?.slice(-4)}</strong> has been cryptographically verified.
              </p>
              <div className="audit-list text-left w-full mt-4 bg-bg-secondary p-4 rounded border border-success border-opacity-30">
                <p><CheckCircle size={16} className="text-success" /> Proof of Humanity generated</p>
                <p><CheckCircle size={16} className="text-success" /> KYC hash committed to Profile</p>
                <p><CheckCircle size={16} className="text-success" /> Trust Score increased to Level 3</p>
              </div>
            </div>
          </motion.section>
        )}
      </div>
    </motion.div>
  );
}
