import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Activity, Users, Lock, ChevronRight } from 'lucide-react';

export default function PharmaDashboard() {
  const [isMatching, setIsMatching] = useState(false);
  const [matchResult, setMatchResult] = useState<number | null>(null);

  const handleMatch = () => {
    setIsMatching(true);
    setMatchResult(null);
    
    // Simulate FHE matching over encrypted data
    setTimeout(() => {
      setMatchResult(312);
      setIsMatching(false);
    }, 2500);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="animate-fade-in"
    >
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="mb-2">Trial <span className="text-gradient">Matching Engine</span></h2>
          <p>Find eligible cohorts without decrypting patient records.</p>
        </div>
        
        <div className="flex gap-4">
          <div className="stat-box py-2 px-4">
            <div className="text-xs text-text-secondary mb-1">Total Vaults</div>
            <div className="font-mono font-bold text-xl">12,408</div>
          </div>
        </div>
      </header>

      <div className="glass-card mb-8">
        <h3 className="mb-6 flex items-center gap-2">
          <Search className="text-accent-secondary" />
          Define Criteria
        </h3>
        
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="form-group">
            <label className="form-label">Required Diagnosis</label>
            <input type="text" className="form-input" placeholder="ICD-10 Code" defaultValue="J45.909" />
          </div>
          <div className="form-group">
            <label className="form-label">Min Age</label>
            <input type="number" className="form-input" placeholder="Years" defaultValue={18} />
          </div>
          <div className="form-group">
            <label className="form-label">Max Age</label>
            <input type="number" className="form-input" placeholder="Years" defaultValue={65} />
          </div>
          <div className="form-group">
            <label className="form-label">Min Hemoglobin</label>
            <input type="number" className="form-input" placeholder="g/dL" defaultValue={12.0} />
          </div>
          <div className="form-group">
            <label className="form-label">Max Hemoglobin</label>
            <input type="number" className="form-input" placeholder="g/dL" defaultValue={16.0} />
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-bg-secondary rounded-lg border border-border-color">
          <div className="flex items-center gap-3">
            <Lock className="text-accent-primary" size={20} />
            <span className="text-sm">Criteria will be FHE-encrypted before submission to the network.</span>
          </div>
          
          <button 
            className="btn-primary"
            onClick={handleMatch}
            disabled={isMatching}
          >
            {isMatching ? 'Evaluating on Ciphertext...' : 'Run Blind Match'}
            {!isMatching && <ChevronRight size={18} />}
          </button>
        </div>
      </div>

      {matchResult !== null && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="grid grid-cols-3 gap-6"
        >
          <div className="glass-card col-span-2">
            <h3 className="mb-4">Matching Results</h3>
            <p className="text-sm mb-6">
              The matching engine evaluated your criteria against encrypted patient records.
              The network returned only an aggregated count.
            </p>
            
            <div className="flex items-center gap-8">
              <div className="stat-box flex-1 border-accent-secondary">
                <div className="stat-value text-accent-secondary">{matchResult}</div>
                <div className="stat-label">Eligible Patients</div>
              </div>
              <div className="stat-box flex-1">
                <div className="stat-value">2.5%</div>
                <div className="stat-label">Cohort Penetration</div>
              </div>
            </div>
            
            <div className="mt-8">
              <button className="btn-primary w-full justify-center">
                <Activity size={18} />
                Send Anonymous Consent Requests
              </button>
            </div>
          </div>
          
          <div className="glass-card">
            <h3 className="mb-4">Compute Proof</h3>
            <div className="p-4 bg-bg-tertiary rounded-lg mb-4">
              <div className="text-xs text-text-secondary mb-1">Execution Time</div>
              <div className="font-mono text-sm">2.41s (Fhenix Network)</div>
            </div>
            <div className="p-4 bg-bg-tertiary rounded-lg">
              <div className="text-xs text-text-secondary mb-1">ZKP Verification Hash</div>
              <div className="font-mono text-xs break-all opacity-70">
                0x7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
