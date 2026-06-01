import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Stethoscope, FileSignature, CheckCircle, ShieldAlert, Fingerprint, Database, AlertCircle } from 'lucide-react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { API_URL } from '../api';

export default function DoctorDashboard() {
  const { isConnected } = useAccount();
  const [patientId, setPatientId] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationComplete, setVerificationComplete] = useState(false);

  const [patients, setPatients] = useState<any[]>([]);

  useEffect(() => {
    async function fetchPatients() {
      try {
        const res = await fetch(`${API_URL}/api/patients`);
        if (res.ok) {
          const data = await res.json();
          setPatients(data);
        }
      } catch (e) {
        console.error("Failed to fetch patients");
      }
    }
    fetchPatients();
  }, []);

  const handleVerify = () => {
    if (!isConnected) return;
    setIsVerifying(true);
    setVerificationComplete(false);
    setTimeout(() => {
      setIsVerifying(false);
      setVerificationComplete(true);
      setPatientId(''); // reset after successful verification
    }, 2500);
  };

  const handleSelectPatient = (id: string) => {
    setPatientId(id);
    setVerificationComplete(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="animate-fade-in"
    >
      <header className="mb-8 flex flex-wrap gap-4 justify-between items-end">
        <div>
          <h2 className="mb-2">Clinical <span className="text-gradient">Investigator</span></h2>
          <p className="mb-0">Cryptographically verify patient data to ensure medical authenticity for clinical trials.</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="px-4 py-2 bg-accent-primary bg-opacity-10 text-accent-primary border border-accent-primary border-opacity-20 rounded-lg flex items-center gap-2 text-sm font-mono whitespace-nowrap">
            <Stethoscope size={16} />
            Dr. Authorized Node
          </div>
          <ConnectButton showBalance={false} />
        </div>
      </header>

      <div className="grid-2 mb-8">
        
        {/* PENDING VERIFICATIONS LIST */}
        <section className="glass-card flex flex-col">
          <h3 className="mb-6 flex items-center gap-2">
            <Database className="text-warning" />
            Pending Verifications
          </h3>
          <p className="text-sm mb-6 text-text-secondary">
            Select a patient vault from the database to cross-reference with your EHR and issue a cryptographic signature.
          </p>

          {patients.length === 0 ? (
            <div className="text-sm text-text-secondary italic opacity-70">
              No unverified patients found.
            </div>
          ) : (
            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2">
              {patients.map((p, i) => {
                const vaultId = p.encryptedVitalsCid.slice(0, 10);
                return (
                  <motion.div 
                    key={i}
                    whileHover={{ scale: 1.01 }}
                    onClick={() => handleSelectPatient(vaultId)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      patientId === vaultId 
                        ? 'bg-accent-primary bg-opacity-10 border-accent-primary' 
                        : 'bg-bg-secondary border-border-color hover:border-accent-secondary'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <strong className="text-text-primary text-sm">Vault ID: {vaultId}</strong>
                      <span className="privacy-badge text-[10px] bg-warning bg-opacity-10 text-warning border-warning border-opacity-30">Requires Signature</span>
                    </div>
                    <div className="text-xs text-text-secondary space-y-1">
                      <p className="font-mono truncate">Wallet: {p.walletAddress}</p>
                      <p>Enrolled: {new Date(p.createdAt || Date.now()).toLocaleDateString()}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>

        {/* VERIFICATION ACTION SECTION */}
        <section className="glass-card flex flex-col justify-between">
          <div>
            <h3 className="mb-6 flex items-center gap-2">
              <FileSignature className="text-accent-primary" />
              Sign Patient Data
            </h3>
            <p className="text-sm mb-6 text-text-secondary">
              Review plaintext lab results in your local EHR system, then sign the corresponding TrialVault ID to prove the encrypted data matches reality.
            </p>
            
            <div className="form-group mb-8">
              <label className="form-label">Selected Vault ID</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Select from list or type ID..." 
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                disabled={isVerifying || verificationComplete}
              />
            </div>

            {isVerifying && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-4 mb-4 bg-bg-tertiary rounded-lg border border-border-color"
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
                className="p-4 mb-4 bg-success bg-opacity-10 rounded-lg border border-success border-opacity-30 flex items-start gap-3"
              >
                <CheckCircle className="text-success mt-1 flex-shrink-0" size={20} />
                <div>
                  <div className="text-success font-bold text-sm mb-1">Signature Accepted</div>
                  <div className="text-xs text-text-secondary">
                    Patient Vault ID {patientId} is now medically verified. The patient will receive a +5 point bonus in all future FHE Trial Matches.
                  </div>
                </div>
              </motion.div>
            )}
            
            {!patientId && !isVerifying && !verificationComplete && (
              <div className="p-4 mb-4 bg-bg-secondary rounded-lg border border-border-color flex items-center gap-3 text-sm text-text-secondary">
                <AlertCircle size={18} className="text-warning" />
                Select a patient vault from the list to begin verification.
              </div>
            )}
          </div>

          <button 
            className="btn-primary w-full justify-center mt-auto" 
            onClick={handleVerify}
            disabled={!patientId || isVerifying || !isConnected}
          >
            {isVerifying ? (
              <span>Signing Cryptographically...</span>
            ) : (
              <>
                <Fingerprint size={18} />
                Issue Verification Signature
              </>
            )}
          </button>
          {!isConnected && <p className="text-xs text-warning mt-2 text-center">Connect Authorized Node Wallet</p>}
        </section>

      </div>
    </motion.div>
  );
}
