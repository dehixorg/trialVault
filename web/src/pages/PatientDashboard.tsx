import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, ClipboardCheck, KeyRound, Shield, UserCheck, ShieldAlert } from 'lucide-react';
import { fhenixAdapter, type EncryptedPatientPayload } from '../fhenix';
import { API_URL } from '../api';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';

export default function PatientDashboard() {
  const { address, isConnected } = useAccount();
  
  const [age, setAge] = useState('45');
  const [bp, setBp] = useState('120 / 80');
  const [hr, setHr] = useState('72 bpm');
  const [dose, setDose] = useState('500 mg');

  const [isEncrypting, setIsEncrypting] = useState(false);
  const [enrolled, setEnrolled] = useState(false);
  const [accessApproved, setAccessApproved] = useState(false);
  const [encryptedPayload, setEncryptedPayload] = useState<EncryptedPatientPayload | null>(null);

  useEffect(() => {
    async function checkExisting() {
      if (!address) return;
      try {
        const res = await fetch(`${API_URL}/api/patients/${address}`);
        if (res.ok) {
          const data = await res.json();
          setEncryptedPayload({
            ciphertextHash: data.encryptedVitalsCid,
            fields: {}
          });
          setEnrolled(true);
        }
      } catch (e) {
        console.error("No existing enrollment found");
      }
    }
    checkExisting();
  }, [address]);

  const enroll = async () => {
    if (!isConnected || !address) return;
    setIsEncrypting(true);
    
    // Simulate FHE Encryption visually
    const payload = await fhenixAdapter.encryptPatientData({
      age: parseInt(age) || 45,
      systolicBp: parseInt(bp) || 120,
    });

    // Save to Render backend Database to persist data for demo
    try {
      await fetch(`${API_URL}/api/patients`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress: address,
          encryptedVitalsCid: payload.ciphertextHash,
        })
      });
    } catch (e) {
      console.error("Failed to save to DB", e);
    }

    setTimeout(() => {
      setEncryptedPayload(payload);
      setEnrolled(true);
      setIsEncrypting(false);
    }, 900);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="animate-fade-in">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h2 className="mb-2">Patient <span className="text-gradient">Portal</span></h2>
          <p className="mb-0">Enroll in a clinical trial with encrypted baseline data and patient-controlled access.</p>
        </div>
        <ConnectButton showBalance={false} />
      </header>

      <div className="grid-2 mb-8">
        <section className="glass-card">
          <div className="flex items-center gap-4 mb-6">
            <div className="icon-tile"><ClipboardCheck /></div>
            <div>
              <h3 className="mb-0">Enroll in Trial TV-204</h3>
              <p className="text-sm mb-0">Cardiovascular dose-response study, Phase II.</p>
              <span className="privacy-badge mt-4">Encrypted before submission</span>
            </div>
          </div>

          {encryptedPayload && !isEncrypting && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-4 p-4 bg-success bg-opacity-10 border border-success border-opacity-30 rounded-lg"
            >
              <div className="flex items-center gap-2 text-success font-bold mb-2">
                <CheckCircle size={18} />
                Vault Sealed & Saved to DB Successfully
              </div>
              <div className="text-xs text-text-secondary space-y-1 font-mono">
                <p>IPFS CID: <span className="text-text-primary truncate block">{encryptedPayload.ciphertextHash.slice(0, 20)}...</span></p>
                <p>Vault ID: <span className="text-text-primary">{encryptedPayload.ciphertextHash.slice(0, 10)}</span></p>
                <p>Time: <span className="text-text-primary">{new Date().toLocaleTimeString()}</span></p>
              </div>

              <div className="mt-4 p-3 border border-warning border-opacity-50 rounded bg-warning bg-opacity-10 flex items-start gap-3">
                <ShieldAlert className="text-warning mt-1 flex-shrink-0" size={18} />
                <div>
                  <div className="text-xs font-bold text-warning">Unverified Medical Record</div>
                  <div className="text-[10px] text-text-secondary mt-1">
                    Your data is encrypted, but to receive higher match scores from Pharma, you must have your primary care physician cryptographically sign this Vault ID.
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          <div className="grid-2 compact mt-6">
            <div className="form-group">
              <label className="form-label">Age</label>
              <input className="form-input" value={age} onChange={e => setAge(e.target.value)} disabled={enrolled} />
            </div>
            <div className="form-group">
              <label className="form-label">Baseline BP</label>
              <input className="form-input" value={bp} onChange={e => setBp(e.target.value)} disabled={enrolled} />
            </div>
            <div className="form-group">
              <label className="form-label">Heart Rate</label>
              <input className="form-input" value={hr} onChange={e => setHr(e.target.value)} disabled={enrolled} />
            </div>
            <div className="form-group">
              <label className="form-label">Dose</label>
              <input className="form-input" value={dose} onChange={e => setDose(e.target.value)} disabled={enrolled} />
            </div>
          </div>

          {isEncrypting && (
            <div className="code-panel mb-4">
              <span>Encrypting locally with FHE-compatible ciphertext...</span>
              <code>age -&gt; euint32 | systolic -&gt; euint32 | consent -&gt; hash</code>
            </div>
          )}

          {encryptedPayload && (
            <div className="code-panel mb-4">
              <span>Local ciphertext commitment saved to DB</span>
              <code>{encryptedPayload.ciphertextHash}</code>
            </div>
          )}

          <button className="btn-primary w-full justify-center" onClick={enroll} disabled={!isConnected || enrolled || isEncrypting}>
            <Shield size={18} /> {enrolled ? 'Encrypted Enrollment Recorded' : isEncrypting ? 'Encrypting & Saving...' : 'Encrypt & Enroll'}
          </button>
        </section>

        <section className="glass-card">
          <h3 className="flex items-center gap-2 mb-6"><KeyRound size={20} /> Data Access</h3>
          <div className="access-request">
            <div>
              <strong>Principal Investigator</strong>
              <p>Requests aggregate-only access for 30 days. No patient name or raw vitals disclosed.</p>
            </div>
            <button className="btn-secondary" onClick={() => setAccessApproved(true)}>
              <UserCheck size={16} /> {accessApproved ? 'Approved' : 'Approve'}
            </button>
          </div>

          <div className="audit-list mt-8">
            <p><CheckCircle size={16} /> Consent form hash committed on-chain</p>
            <p><CheckCircle size={16} /> Baseline vitals encrypted before upload</p>
            <p><CheckCircle size={16} /> Access grant expires automatically</p>
          </div>
        </section>
      </div>

      {enrolled && (
        <motion.section initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="glass-card border-success">
          <h3>My Trial Results</h3>
          <p><span className="privacy-badge">Sealed to patient wallet</span></p>
          <div className="stats-row">
            <div className="stat-box"><div className="stat-value text-success">84%</div><div className="stat-label">Compliance</div></div>
            <div className="stat-box"><div className="stat-value">Mild</div><div className="stat-label">Side Effects</div></div>
            <div className="stat-box"><div className="stat-value text-accent-secondary">Positive</div><div className="stat-label">Response</div></div>
          </div>
        </motion.section>
      )}
    </motion.div>
  );
}
