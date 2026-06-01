import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Shield, ShieldAlert, Database, Search } from 'lucide-react';
import { fhenixAdapter } from '../fhenix';
import { API_URL } from '../api';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';

export default function PatientDashboard() {
  const { address, isConnected } = useAccount();
  
  const [trials, setTrials] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);

  const [encryptingId, setEncryptingId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [trialsRes, enrollmentsRes, profileRes] = await Promise.all([
          fetch(`${API_URL}/api/trials`),
          address ? fetch(`${API_URL}/api/enrollments/${address}`) : Promise.resolve({ ok: false, json: () => [] }),
          address ? fetch(`${API_URL}/api/profiles/${address}`) : Promise.resolve({ ok: false, json: () => null })
        ]);

        if (trialsRes.ok) setTrials(await trialsRes.json());
        if (enrollmentsRes.ok) setEnrollments(await enrollmentsRes.json());
        if (profileRes.ok) setProfile(await profileRes.json());
      } catch (e) {
        console.error("Failed to fetch data");
      }
    }
    fetchData();
  }, [address]);

  const enroll = async (trial: any) => {
    if (!isConnected || !address) return;
    
    // Check if profile exists
    if (!profile) {
      alert("Please create your Health Profile first!");
      return;
    }

    setEncryptingId(trial._id);
    
    // Simulate FHE Encryption using Profile Data
    const payload = await fhenixAdapter.encryptPatientData({
      age: profile.age || 45,
      systolicBp: parseInt(profile.baselineBp?.split('/')[0]) || 120,
    });

    try {
      const res = await fetch(`${API_URL}/api/enrollments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress: address,
          trialId: trial._id || trial.criteriaHash,
          trialName: trial.trialName,
          encryptedVitalsCid: payload.ciphertextHash,
        })
      });
      
      if (res.ok) {
        const newEnrollment = await res.json();
        setEnrollments(prev => [newEnrollment, ...prev]);
      }
    } catch (e) {
      console.error("Failed to enroll", e);
    }

    setTimeout(() => {
      setEncryptingId(null);
    }, 900);
  };

  const isEnrolled = (trialId: string) => {
    return enrollments.some(e => e.trialId === trialId);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="animate-fade-in">
      <header className="mb-8 flex flex-wrap gap-4 justify-between items-end">
        <div>
          <h2 className="mb-2">Trial <span className="text-gradient">Marketplace</span></h2>
          <p className="mb-0">Discover active trials, encrypt your profile vitals using FHE, and securely enroll.</p>
        </div>
        <ConnectButton showBalance={false} />
      </header>

      <div className="grid-2 mb-8">
        
        {/* AVAILABLE TRIALS SECTION */}
        <section className="glass-card">
          <h3 className="flex items-center gap-2 mb-6"><Search className="text-accent-primary" /> Active Trials</h3>
          
          {trials.length === 0 ? (
            <div className="text-sm text-text-secondary italic opacity-70">
              No active clinical trials available at the moment.
            </div>
          ) : (
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
              {trials.map((trial, i) => {
                const alreadyEnrolled = isEnrolled(trial._id || trial.criteriaHash);
                const encryptingThis = encryptingId === trial._id;

                return (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 bg-bg-secondary border border-border-color rounded-lg flex flex-col justify-between"
                  >
                    <div className="mb-4">
                      <div className="flex justify-between items-start mb-2">
                        <strong className="text-text-primary text-lg">{trial.trialName}</strong>
                        <span className="privacy-badge">{trial.phase || 'Phase II'}</span>
                      </div>
                      <div className="text-xs text-text-secondary space-y-1">
                        <p>Condition: <span className="text-accent-secondary">{trial.targetCondition || 'N/A'}</span></p>
                        <p>Requires: Min Age {trial.minAge || 'N/A'}, Max BP {trial.maxBp || 'N/A'}</p>
                        {trial.description && <p className="mt-2 opacity-80">{trial.description}</p>}
                      </div>
                    </div>
                    
                    {encryptingThis && (
                      <div className="code-panel mb-4 text-[10px]">
                        <span>Encrypting Profile Vitals (FHE)...</span>
                        <code>age -&gt; euint32 | bp -&gt; euint32</code>
                      </div>
                    )}

                    <button 
                      className={alreadyEnrolled ? "btn-secondary" : "btn-primary"} 
                      onClick={() => enroll(trial)} 
                      disabled={!isConnected || alreadyEnrolled || encryptingId !== null}
                    >
                      {alreadyEnrolled ? (
                        <><CheckCircle size={16} /> Enrolled</>
                      ) : encryptingThis ? (
                        <><Shield size={16} /> Encrypting...</>
                      ) : (
                        <><Shield size={16} /> Encrypt & Enroll</>
                      )}
                    </button>
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>

        {/* MY ENROLLMENTS SECTION */}
        <section className="glass-card">
          <h3 className="flex items-center gap-2 mb-6"><Database className="text-success" /> My Enrollments</h3>
          
          {enrollments.length === 0 ? (
            <div className="text-sm text-text-secondary italic opacity-70">
              You haven't enrolled in any trials yet.
            </div>
          ) : (
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
              {enrollments.map((env, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 bg-success bg-opacity-10 border border-success border-opacity-30 rounded-lg"
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2 text-success font-bold">
                      <CheckCircle size={18} />
                      {env.trialName || 'Unknown Trial'}
                    </div>
                  </div>
                  
                  <div className="text-xs text-text-secondary space-y-1 font-mono break-all">
                    <p>Vault CID: <span className="text-text-primary">{env.encryptedVitalsCid}</span></p>
                    <p>Time: <span className="text-text-primary">{new Date(env.createdAt || Date.now()).toLocaleString()}</span></p>
                  </div>

                  <div className="mt-4 p-3 border border-warning border-opacity-50 rounded bg-warning bg-opacity-10 flex items-start gap-3">
                    <ShieldAlert className="text-warning mt-1 flex-shrink-0" size={18} />
                    <div>
                      <div className="text-xs font-bold text-warning">Unverified Medical Record</div>
                      <div className="text-[10px] text-text-secondary mt-1">
                        Your data is encrypted. To receive higher match scores, your primary care physician must cryptographically sign this Vault ID.
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </div>
    </motion.div>
  );
}
