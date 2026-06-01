import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Globe, Database, Activity, ShieldCheck, ActivitySquare } from 'lucide-react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { API_URL } from '../api';

export default function ExplorerDashboard() {
  const [trials, setTrials] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNetworkData() {
      try {
        const [trialsRes, enrollmentsRes] = await Promise.all([
          fetch(`${API_URL}/api/trials`),
          fetch(`${API_URL}/api/enrollments`)
        ]);

        if (trialsRes.ok) setTrials(await trialsRes.json());
        if (enrollmentsRes.ok) setEnrollments(await enrollmentsRes.json());
      } catch (e) {
        console.error("Failed to fetch network data");
      } finally {
        setLoading(false);
      }
    }
    fetchNetworkData();
    // Poll every 10 seconds for demo effect
    const interval = setInterval(fetchNetworkData, 10000);
    return () => clearInterval(interval);
  }, []);

  // Combine and sort events
  const allEvents = [
    ...trials.map(t => ({ type: 'trial_deployed', date: new Date(t.createdAt || Date.now()), data: t })),
    ...enrollments.map(e => ({ type: 'patient_enrolled', date: new Date(e.createdAt || Date.now()), data: e }))
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="animate-fade-in">
      <header className="mb-8 flex flex-wrap gap-4 justify-between items-end">
        <div>
          <h2 className="mb-2">Network <span className="text-gradient">Explorer</span></h2>
          <p className="mb-0">Live feed of all zero-knowledge and FHE transactions happening across the TrialVault ecosystem.</p>
        </div>
        <ConnectButton showBalance={false} />
      </header>

      <div className="grid-3 mb-8">
        <div className="stat-box">
          <div className="stat-value text-accent-primary">{trials.length}</div>
          <div className="stat-label">Active Trials</div>
        </div>
        <div className="stat-box">
          <div className="stat-value text-accent-secondary">{enrollments.length}</div>
          <div className="stat-label">Total Enrollments</div>
        </div>
        <div className="stat-box">
          <div className="stat-value text-success">FHE</div>
          <div className="stat-label">Encryption Protocol</div>
        </div>
      </div>

      <section className="glass-card">
        <h3 className="mb-6 flex items-center gap-2"><Globe className="text-accent-secondary" /> Global Transaction Ledger</h3>
        
        {loading ? (
          <div className="text-center p-8 text-text-secondary">Syncing with network...</div>
        ) : allEvents.length === 0 ? (
          <div className="text-sm text-text-secondary italic opacity-70">
            No transactions found on the network.
          </div>
        ) : (
          <div className="space-y-4">
            {allEvents.map((event, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="p-4 bg-bg-secondary border border-border-color rounded-lg flex gap-4 items-start hover:border-accent-primary transition-colors"
              >
                <div className="mt-1">
                  {event.type === 'trial_deployed' ? (
                    <div className="p-2 bg-accent-secondary bg-opacity-20 rounded-full text-accent-secondary">
                      <ActivitySquare size={20} />
                    </div>
                  ) : (
                    <div className="p-2 bg-success bg-opacity-20 rounded-full text-success">
                      <ShieldCheck size={20} />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap justify-between items-start gap-2 mb-1">
                    <strong className="text-text-primary text-sm">
                      {event.type === 'trial_deployed' ? 'Trial Contract Deployed' : 'Patient Vault Enrolled'}
                    </strong>
                    <span className="text-xs text-text-secondary font-mono">{event.date.toLocaleString()}</span>
                  </div>
                  
                  {event.type === 'trial_deployed' ? (
                    <div className="text-xs text-text-secondary space-y-1">
                      <p>Sponsor: <span className="font-mono text-[10px] break-all">{event.data.sponsorAddress}</span></p>
                      <p>Protocol: <span className="text-accent-secondary">{event.data.trialName}</span> ({event.data.protocolNumber})</p>
                      <p>Condition: {event.data.targetCondition}</p>
                      <div className="mt-2 p-2 bg-bg-tertiary rounded text-[10px] font-mono break-all border border-border-color opacity-70">
                        TX Hash: {event.data.criteriaHash}
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-text-secondary space-y-1">
                      <p>Wallet: <span className="font-mono text-[10px] break-all">{event.data.walletAddress}</span></p>
                      <p>Joined Trial: <span className="text-success">{event.data.trialName || event.data.trialId}</span></p>
                      <div className="mt-2 p-2 bg-bg-tertiary rounded text-[10px] font-mono break-all border border-border-color opacity-70">
                        Encrypted Vault CID: {event.data.encryptedVitalsCid}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </motion.div>
  );
}
