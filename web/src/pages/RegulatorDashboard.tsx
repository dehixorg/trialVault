import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, EyeOff, FileSearch, ShieldCheck } from 'lucide-react';
import { auditEvents } from '../trialData';
import demoAggregate from '../data/demoAggregate.json';

export default function RegulatorDashboard() {
  const [auditStarted, setAuditStarted] = useState(false);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="animate-fade-in">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="mb-2">FDA <span className="text-gradient">Audit</span></h2>
          <p>Verify data integrity, consent, and access controls without opening patient PII.</p>
        </div>
        <button className="btn-primary" onClick={() => setAuditStarted(true)}>
          <FileSearch size={18} /> Start Audit
        </button>
      </header>

      <div className="grid-2 mb-8">
        <section className="glass-card">
          <h3 className="mb-6 flex items-center gap-2"><ShieldCheck className="text-success" /> Integrity Checks</h3>
          <div className="audit-list">
            <p><CheckCircle size={16} /> All {demoAggregate.cohortSize} synthetic patient commitments present</p>
            <p><CheckCircle size={16} /> No post-lock dataset mutation detected</p>
            <p><CheckCircle size={16} /> Aggregate response receipt verified for {demoAggregate.cohortSize} local records</p>
            <p><CheckCircle size={16} /> Sponsor signature matches submission wallet</p>
          </div>
        </section>

        <section className="glass-card">
          <h3 className="mb-6 flex items-center gap-2"><EyeOff className="text-accent-primary" /> PII Boundary</h3>
          <div className="proof-grid">
            <div><span>Patient Names</span><strong>Hidden</strong></div>
            <div><span>Raw Vitals</span><strong>Encrypted</strong></div>
            <div><span>Consent Forms</span><strong>Hash + ciphertext</strong></div>
            <div><span>Audit Role</span><strong>RegulatorAudit</strong></div>
          </div>
        </section>
      </div>

      <section className="glass-card bg-bg-secondary bg-opacity-50">
        <h3 className="mb-4 flex items-center gap-2"><AlertTriangle className="text-warning" /> 21 CFR Part 11 Evidence</h3>
        <div className="timeline">
          {auditEvents.map((event) => (
            <p key={`${event.time}-${event.tx}`}>
              [{event.time}] {event.actor}: {event.action} <span className="tx-link">{event.tx}</span> | {event.privacy}
            </p>
          ))}
          {auditStarted && <p>[2026-06-01 10:22 UTC] Regulator audit session opened <span className="privacy-badge">No PII decrypted</span></p>}
        </div>
      </section>
    </motion.div>
  );
}
