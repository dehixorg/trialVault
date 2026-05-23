import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Activity, CheckCircle, EyeOff } from 'lucide-react';

export default function RegulatorDashboard() {
  const [threshold, setThreshold] = useState(10);
  const [encryptedSeverity, setEncryptedSeverity] = useState('0x...');

  const handleSetThreshold = () => {
    // In a real app, this sends an encrypted threshold to the contract
    alert(`Threshold of ${threshold} encrypted and set on-chain.`);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="animate-fade-in"
    >
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="mb-2">Regulatory <span className="text-gradient">Oversight</span></h2>
          <p>Monitor aggregated trial safety metrics without accessing private patient records.</p>
        </div>
        
        <div className="flex gap-4">
          <div className="stat-box py-2 px-4 border-warning">
            <div className="text-xs text-text-secondary mb-1">Network Status</div>
            <div className="font-mono font-bold text-success flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-success"></div>
              All Systems Nominal
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-8 mb-8">
        <div className="glass-card">
          <h3 className="mb-6 flex items-center gap-2">
            <AlertTriangle className="text-warning" />
            Adverse Event Threshold
          </h3>
          <p className="text-sm mb-6">
            Set an encrypted threshold. The smart contract will automatically pause the trial if the cumulative severity of adverse events exceeds this limit.
          </p>
          
          <div className="flex gap-4 items-end">
            <div className="form-group flex-1 mb-0">
              <label className="form-label">Severity Limit</label>
              <input 
                type="number" 
                className="form-input" 
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
              />
            </div>
            <button className="btn-primary whitespace-nowrap" onClick={handleSetThreshold}>
              Set Encrypted Limit
            </button>
          </div>
        </div>

        <div className="glass-card">
          <h3 className="mb-6 flex items-center gap-2">
            <Activity className="text-accent-primary" />
            Real-time Telemetry
          </h3>
          
          <div className="space-y-4">
            <div className="p-4 bg-bg-secondary rounded-lg border border-border-color flex justify-between items-center">
              <div>
                <span className="text-sm block">Current Cumulative Severity</span>
                <span className="text-xs text-text-secondary">Stored entirely as ciphertext on-chain.</span>
              </div>
              <div className="flex items-center gap-2">
                <EyeOff size={16} className="text-text-secondary" />
                <span className="font-mono text-xs opacity-50 bg-bg-tertiary px-2 py-1 rounded">0x3b8...9f1</span>
              </div>
            </div>

            <div className="p-4 bg-bg-secondary rounded-lg border border-border-color flex justify-between items-center">
              <div>
                <span className="text-sm block">Threshold Breached?</span>
                <span className="text-xs text-text-secondary">Evaluated via FHE homomorphic comparison.</span>
              </div>
              <div className="flex items-center gap-2 text-success font-medium">
                <CheckCircle size={16} />
                No
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="glass-card bg-bg-secondary bg-opacity-50">
        <h4 className="text-sm text-text-secondary mb-2">Audit Log</h4>
        <div className="font-mono text-xs text-text-secondary space-y-2 opacity-70">
          <p>[14:02:41] Fhenix Block 894123: Patient dataset 104 registered.</p>
          <p>[14:05:12] Fhenix Block 894145: Blind match executed by 0x4A...2F1.</p>
          <p>[14:10:05] Fhenix Block 894190: Adverse event reported (encrypted severity).</p>
        </div>
      </div>
    </motion.div>
  );
}
