import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, ClipboardCheck, KeyRound, Shield, UserCheck, ShieldAlert, Database } from 'lucide-react';
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
  
  // Now stores an array of past enrollments
  const [enrollments, setEnrollments] = useState<any[]>([]);

  useEffect(() => {
    async function fetchEnrollments() {
      if (!address) return;
      try {
        const res = await fetch(`${API_URL}/api/patients/${address}`);
        if (res.ok) {
          const data = await res.json();
          // data is an array since we updated server.js
          if (data && data.length > 0) {
            setEnrollments(data);
            setEnrolled(true);
          }
        }
      } catch (e) {
        console.error("No existing enrollments found");
      }
    }
    fetchEnrollments();
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
      const res = await fetch(`${API_URL}/api/patients`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress: address,
          encryptedVitalsCid: payload.ciphertextHash,
        })
      });
      
      if (res.ok) {
        const newEnrollment = await res.json();
        setEnrollments(prev => [newEnrollment, ...prev]);
      }
    } catch (e) {
      console.error("Failed to save to DB", e);
    }

    setTimeout(() => {
      setEnrolled(true);
      setIsEncrypting(false);
    }, 900);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="animate-fade-in">
      <header className="mb-8 flex flex-wrap gap-4 justify-between items-end">
        <div>
          <h2 className="mb-2">Patient <span className="text-gradient">Portal</span></h2>
          <p className="mb-0">Securely encrypt your health data and enroll in clinical trials using FHE.</p>
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

          <div className="grid-2 compact mt-6">
            <div className="form-group">
              <label className="form-label">Age</label>
              <input className="form-input" value={age} onChange={e => setAge(e.target.value)} disabled={isEncrypting} />
            </div>
            <div className="form-group">
              <label className="form-label">Baseline BP</label>
              <input className="form-input" value={bp} onChange={e => setBp(e.target.value)} disabled={isEncrypting} />
            </div>
            <div className="form-group">
              <label className="form-label">Heart Rate</label>
              <input className="form-input" value={hr} onChange={e => setHr(e.target.value)} disabled={isEncrypting} />
            </div>
            <div className="form-group">
              <label className="form-label">Dose</label>
              <input className="form-input" value={dose} onChange={e => setDose(e.target.value)} disabled={isEncrypting} />
            </div>
          </div>

          {isEncrypting && (
            <div className="code-panel mb-4">
              <span>Encrypting locally with FHE-compatible ciphertext...</span>
              <code>age -&gt; euint32 | systolic -&gt; euint32 | consent -&gt; hash</code>
            </div>
          )}

          <button className="btn-primary w-full justify-center" onClick={enroll} disabled={!isConnected || isEncrypting}>
            <Shield size={18} /> {isEncrypting ? 'Encrypting & Saving...' : 'Encrypt & Enroll'}
          </button>
        </section>

        <section className="glass-card">
          <h3 className="flex items-center gap-2 mb-6"><Database size={20} className="text-accent-primary" /> My Enrollments</h3>
          
          {enrollments.length === 0 ? (
            <div className="text-sm text-text-secondary italic opacity-70">
              No previous enrollments found for this wallet.
            </div>
          ) : (
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {enrollments.map((env, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 bg-success bg-opacity-10 border border-success border-opacity-30 rounded-lg"
                >
                  <div className="flex items-center gap-2 text-success font-bold mb-2">
                    <CheckCircle size={18} />
                    Vault Sealed & Saved to DB
                  </div>
                  <div className="text-xs text-text-secondary space-y-1 font-mono">
                    <p>IPFS CID: <span className="text-text-primary truncate block">{env.encryptedVitalsCid.slice(0, 25)}...</span></p>
                    <p>Time: <span className="text-text-primary">{new Date(env.createdAt || Date.now()).toLocaleString()}</span></p>
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
              ))}
            </div>
          )}
        </section>
      </div>

      <div className="grid-2 mb-8">
        <section className="glass-card border-success">
          <h3 className="flex items-center gap-2 mb-4"><KeyRound size={20} /> Data Access</h3>
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
    </motion.div>
  );
}
