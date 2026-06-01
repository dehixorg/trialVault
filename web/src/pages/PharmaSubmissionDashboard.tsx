import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Download, FileCheck, Fingerprint, PackageCheck } from 'lucide-react';
import { evidencePackage, trialStatus } from '../trialData';
import demoAggregate from '../data/demoAggregate.json';

export default function PharmaSubmissionDashboard() {
  const [generated, setGenerated] = useState(false);

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

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="animate-fade-in">
      <header className="mb-8">
        <h2 className="mb-2">Pharma <span className="text-gradient">Submission</span></h2>
        <p>Generate an FDA-ready evidence package with encrypted data commitments and audit proofs.</p>
      </header>

      <div className="grid-2 mb-8">
        <section className="glass-card">
          <h3 className="mb-6 flex items-center gap-2"><PackageCheck className="text-accent-primary" /> Submission Builder</h3>
          <div className="audit-list mb-8">
            <p><CheckCircle size={16} /> Protocol hash linked to Trial TV-204</p>
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
