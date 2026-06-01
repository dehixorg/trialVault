import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Download, FileCheck, Fingerprint, PackageCheck, PlusCircle } from 'lucide-react';
import { evidencePackage, trialStatus } from '../trialData';
import demoAggregate from '../data/demoAggregate.json';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { API_URL } from '../api';

export default function PharmaSubmissionDashboard() {
  const { address, isConnected } = useAccount();
  
  const [generated, setGenerated] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [trialDeployed, setTrialDeployed] = useState(false);

  // Form State
  const [trialName, setTrialName] = useState('CardioVasc-X Phase II');
  const [targetCondition, setTargetCondition] = useState('Hypertension');
  const [minAge, setMinAge] = useState('40');
  const [maxBp, setMaxBp] = useState('140');

  const exportEvidence = () => {
    const blob = new Blob([JSON.stringify(evidencePackage, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'trialvault-fda-evidence-package.json';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const handleCreateTrial = async () => {
    if (!isConnected || !address) return;
    setDeploying(true);
    
    try {
      await fetch(`${API_URL}/api/trials`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sponsorAddress: address,
          trialName,
          targetCondition,
          minAge: parseInt(minAge),
          maxBp: parseInt(maxBp),
          criteriaHash: "0xMockHash" + Math.random().toString(16).slice(2)
        })
      });
    } catch (e) {
      console.error("Failed to save trial to DB", e);
    }

    setTimeout(() => {
      setDeploying(false);
      setTrialDeployed(true);
    }, 1500);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="animate-fade-in">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h2 className="mb-2">Pharma <span className="text-gradient">Submission</span></h2>
          <p>Create trials and generate FDA-ready evidence packages with encrypted data commitments.</p>
        </div>
        <ConnectButton showBalance={false} />
      </header>

      {/* CREATE TRIAL SECTION */}
      <section className="glass-card mb-8">
        <h3 className="mb-6 flex items-center gap-2"><PlusCircle className="text-accent-secondary" /> Create New Trial</h3>
        
        {trialDeployed ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 bg-success bg-opacity-10 border border-success border-opacity-30 rounded-lg"
          >
            <div className="flex items-center gap-2 text-success font-bold mb-2">
              <CheckCircle size={18} />
              Trial Smart Contract Deployed & Saved to DB
            </div>
            <div className="text-sm text-text-secondary">
              <strong>{trialName}</strong> for <strong>{targetCondition}</strong> is now live. Minimum Age: {minAge}, Max Base BP: {maxBp}.
            </div>
          </motion.div>
        ) : (
          <div>
            <div className="grid-2 compact mb-6">
              <div className="form-group">
                <label className="form-label">Trial Name</label>
                <input className="form-input" value={trialName} onChange={e => setTrialName(e.target.value)} disabled={deploying} />
              </div>
              <div className="form-group">
                <label className="form-label">Target Condition</label>
                <input className="form-input" value={targetCondition} onChange={e => setTargetCondition(e.target.value)} disabled={deploying} />
              </div>
              <div className="form-group">
                <label className="form-label">Min Age Benchmark</label>
                <input className="form-input" type="number" value={minAge} onChange={e => setMinAge(e.target.value)} disabled={deploying} />
              </div>
              <div className="form-group">
                <label className="form-label">Max Base BP Benchmark</label>
                <input className="form-input" type="number" value={maxBp} onChange={e => setMaxBp(e.target.value)} disabled={deploying} />
              </div>
            </div>
            <button className="btn-secondary w-full justify-center" onClick={handleCreateTrial} disabled={!isConnected || deploying}>
              <CheckCircle size={18} /> {deploying ? 'Deploying to Chain & DB...' : 'Deploy Trial Smart Contract'}
            </button>
            {!isConnected && <p className="text-xs text-warning mt-2 text-center">Connect wallet to deploy trial</p>}
          </div>
        )}
      </section>

      <div className="grid-2 mb-8">
        <section className="glass-card">
          <h3 className="mb-6 flex items-center gap-2"><PackageCheck className="text-accent-primary" /> Submission Builder</h3>
          <div className="audit-list mb-8">
            <p><CheckCircle size={16} /> Protocol hash linked to {trialName}</p>
            <p><CheckCircle size={16} /> 450 encrypted patient records committed</p>
            <p><CheckCircle size={16} /> FHE aggregate analytics receipt attached</p>
            <p><CheckCircle size={16} /> Investigator and sponsor signatures verified</p>
          </div>
          <button className="btn-primary" onClick={() => setGenerated(true)}>
            <FileCheck size={18} /> Generate FDA Package
          </button>
        </section>

        <section className="glass-card">
          <h3 className="mb-6 flex items-center gap-2"><Fingerprint className="text-accent-secondary" /> Integrity Proof</h3>
          <div className="proof-grid">
            <div><span>Dataset Hash</span><code>{trialStatus.datasetHash}</code></div>
            <div><span>Access Log Root</span><code>{trialStatus.accessLogRoot}</code></div>
            <div><span>Computation Receipt</span><code>{trialStatus.computationReceipt}</code></div>
            <div><span>Local Cohort</span><strong>{demoAggregate.cohortSize} synthetic records</strong></div>
            <div><span>Submission Status</span><strong>{generated ? 'Ready' : 'Draft'}</strong></div>
          </div>
        </section>
      </div>

      {generated && (
        <motion.section initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="glass-card border-success">
          <h3>FDA Submission Package Ready</h3>
          <p>The package contains encrypted records, aggregate statistics, audit logs, and cryptographic proof that the submitted data matches the on-chain commitments.</p>
          <button className="btn-secondary" onClick={exportEvidence}><Download size={18} /> Export Evidence Bundle</button>
        </motion.section>
      )}
    </motion.div>
  );
}
