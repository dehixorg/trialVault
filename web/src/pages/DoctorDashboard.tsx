import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Stethoscope, FileSignature, CheckCircle, ShieldAlert, Fingerprint } from 'lucide-react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';

export default function DoctorDashboard() {
  const { isConnected } = useAccount();
  const [patientId, setPatientId] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationComplete, setVerificationComplete] = useState(false);

  const handleVerify = () => {
    if (!isConnected) return;
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setVerificationComplete(true);
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
          <h2 className="mb-2">Clinical <span className="text-gradient">Investigator</span></h2>
          <p className="mb-0">Cryptographically verify patient data to ensure medical authenticity.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="px-4 py-2 bg-accent-primary bg-opacity-10 text-accent-primary border border-accent-primary border-opacity-20 rounded-lg flex items-center gap-2 text-sm font-mono">
            <Stethoscope size={16} />
            Dr. Authorized Node
          </div>
          <ConnectButton showBalance={false} />
        </div>
      </header>

      <div className="grid grid-cols-2 gap-8 mb-8">
        <div className="glass-card flex flex-col justify-between">
          <div>
            <h3 className="mb-6 flex items-center gap-2">
              <FileSignature className="text-accent-primary" />
              Sign Patient Data
            </h3>
            <p className="text-sm mb-6">
              Review plaintext lab results in your local EHR system, then sign the corresponding TrialVault ID to prove the encrypted data matches reality.
            </p>
            
            <div className="form-group">
              <label className="form-label">Patient Vault ID / Token ID</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g., 104" 
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                disabled={isVerifying || verificationComplete}
              />
            </div>
          </div>

          <button 
            className="btn-primary w-full justify-center mt-4" 
            onClick={handleVerify}
            disabled={!patientId || isVerifying || verificationComplete || !isConnected}
          >
            {isVerifying ? (
              <span>Signing Cryptographically...</span>
            ) : verificationComplete ? (
              <>
                <CheckCircle size={18} />
                Data Verified
              </>
            ) : (
              <>
                <Fingerprint size={18} />
                Issue Verification Signature
              </>
            )}
          </button>
        </div>

        <div className="glass-card">
          <h3 className="mb-6 flex items-center gap-2">
            <ShieldAlert className="text-warning" />
            Verification Log
          </h3>
          
          <div className="space-y-4">
            {isVerifying && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-4 bg-bg-tertiary rounded-lg border border-border-color"
              >
                <div className="text-xs text-text-secondary mb-2">Generating Signature Proof:</div>
                <pre className="text-[10px] text-accent-primary font-mono bg-bg-secondary p-2 rounded overflow-x-auto">
                  {`> Retrieving PatientVault[${patientId}]
> Generating ECDSA signature...
> Hash: 0x8f2a...9c1b
> Executing verifyPatientData(${patientId})
> Waiting for block confirmation...`}
                </pre>
              </motion.div>
            )}

            {verificationComplete && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 bg-success bg-opacity-10 rounded-lg border border-success border-opacity-30 flex items-start gap-3"
              >
                <CheckCircle className="text-success mt-1" size={20} />
                <div>
                  <div className="text-success font-bold text-sm mb-1">Signature Accepted</div>
                  <div className="text-xs text-text-secondary">
                    Patient Vault ID {patientId} is now medically verified. The patient will receive a +5 point bonus in all future FHE Trial Matches.
                  </div>
                </div>
              </motion.div>
            )}

            <div className="p-4 bg-bg-secondary rounded-lg border border-border-color flex justify-between items-center opacity-50">
              <div>
                <span className="text-sm block">Vault ID: 103</span>
                <span className="text-xs text-text-secondary">Verified by 0x4F9...b1A2</span>
              </div>
              <CheckCircle size={16} className="text-success" />
            </div>
            
            <div className="p-4 bg-bg-secondary rounded-lg border border-border-color flex justify-between items-center opacity-50">
              <div>
                <span className="text-sm block">Vault ID: 98</span>
                <span className="text-xs text-text-secondary">Verified by 0x4F9...b1A2</span>
              </div>
              <CheckCircle size={16} className="text-success" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
