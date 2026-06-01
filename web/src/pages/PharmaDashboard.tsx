import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, ChevronRight, Lock, ShieldCheck } from 'lucide-react';
import FheVisualizer from '../components/FheVisualizer';
import { trialStatus } from '../trialData';
import demoAggregate from '../data/demoAggregate.json';

export default function PharmaDashboard() {
  const [isComputing, setIsComputing] = useState(false);
  const [statsReady, setStatsReady] = useState(false);

  const runAnalytics = () => {
    setStatsReady(false);
    setIsComputing(true);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="animate-fade-in">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="mb-2">Research <span className="text-gradient">Analytics</span></h2>
          <p>Compute trial-level statistics without exposing individual patient records.</p>
        </div>
        <div className="stat-box py-2 px-4">
          <div className="text-xs text-text-secondary mb-1">Encrypted Records</div>
          <div className="font-mono font-bold text-xl">450</div>
        </div>
      </header>

      <section className="glass-card mb-8">
        <h3 className="mb-6 flex items-center gap-2"><BarChart3 className="text-accent-secondary" /> Trial TV-204 Analysis</h3>
        <div className="grid-3 mb-8">
          <div className="metric-card"><span>Primary Endpoint</span><strong>Blood pressure reduction</strong></div>
          <div className="metric-card"><span>Cohort</span><strong>Phase II, 450 patients</strong></div>
          <div className="metric-card"><span>Access Level</span><strong>ResearcherAggregate</strong></div>
        </div>

        <div className="flex items-center justify-between p-4 bg-bg-secondary rounded-lg border border-border-color">
          <div className="flex items-center gap-3">
            <Lock className="text-accent-primary" size={20} />
            <span className="text-sm">FHE computes response, compliance, and adverse-event aggregates over encrypted rows.</span>
          </div>
          <button className="btn-primary" onClick={runAnalytics} disabled={isComputing}>
            {isComputing ? 'Computing...' : 'Run FHE Analytics'} {!isComputing && <ChevronRight size={18} />}
          </button>
        </div>
      </section>

      {isComputing && (
        <FheVisualizer onComplete={() => {
          setIsComputing(false);
          setStatsReady(true);
        }} />
      )}

      {statsReady && (
        <motion.section initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="grid-2">
          <div className="glass-card">
            <h3 className="mb-4">Aggregate Results</h3>
            <div className="stats-row">
              <div className="stat-box"><div className="stat-value text-accent-secondary">{demoAggregate.responseRatePercentage}%</div><div className="stat-label">Response Rate</div></div>
              <div className="stat-box"><div className="stat-value">{demoAggregate.averageAdverseEventSeverity}</div><div className="stat-label">Avg Severity</div></div>
              <div className="stat-box"><div className="stat-value text-success">{Math.round(demoAggregate.averageCompliancePercentage)}%</div><div className="stat-label">Compliance</div></div>
            </div>
          </div>
          <div className="glass-card">
            <h3 className="mb-4 flex items-center gap-2"><ShieldCheck size={20} /> Privacy Receipt</h3>
            <div className="audit-list">
              <p>No patient names accessed</p>
              <p>No individual vitals decrypted</p>
              <p>Computation receipt: <span className="tx-link">{trialStatus.computationReceipt}</span></p>
              <p>Cohort threshold satisfied: n = {trialStatus.enrolledPatients}</p>
            </div>
          </div>
        </motion.section>
      )}
    </motion.div>
  );
}
