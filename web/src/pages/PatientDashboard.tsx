import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, ClipboardCheck, KeyRound, Shield, UserCheck, Wallet, ShieldAlert } from 'lucide-react';
import { fhenixAdapter, type EncryptedPatientPayload } from '../fhenix';

export default function PatientDashboard() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [enrolled, setEnrolled] = useState(false);
  const [accessApproved, setAccessApproved] = useState(false);
  const [encryptedPayload, setEncryptedPayload] = useState<EncryptedPatientPayload | null>(null);

  const enroll = async () => {
    if (!walletConnected) return;
    setIsEncrypting(true);
    const payload = await fhenixAdapter.encryptPatientData({
      age: 45,
      systolicBp: 120,
      diastolicBp: 80,
      heartRate: 72,
      doseMg: 500,
    });
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
        <button className={walletConnected ? 'btn-secondary' : 'btn-primary'} onClick={() => setWalletConnected(true)}>
          <Wallet size={18} /> {walletConnected ? '0x4F9...b1A2' : 'Connect Wallet'}
        </button>
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
                Vault Sealed Successfully
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
              <input className="form-input" defaultValue="45" />
            </div>
            <div className="form-group">
              <label className="form-label">Baseline BP</label>
              <input className="form-input" defaultValue="120 / 80" />
            </div>
            <div className="form-group">
              <label className="form-label">Heart Rate</label>
              <input className="form-input" defaultValue="72 bpm" />
            </div>
            <div className="form-group">
              <label className="form-label">Dose</label>
              <input className="form-input" defaultValue="500 mg" />
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
              <span>Local ciphertext commitment</span>
              <code>{encryptedPayload.ciphertextHash}</code>
            </div>
          )}

          <button className="btn-primary w-full justify-center" onClick={enroll} disabled={!walletConnected || enrolled || isEncrypting}>
            <Shield size={18} /> {enrolled ? 'Encrypted Enrollment Recorded' : isEncrypting ? 'Encrypting...' : 'Encrypt & Enroll'}
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
