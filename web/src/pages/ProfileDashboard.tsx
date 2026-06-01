import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, User, Activity, Heart, ShieldCheck, Database, FileText } from 'lucide-react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { API_URL } from '../api';

export default function ProfileDashboard() {
  const { address, isConnected } = useAccount();
  
  const [age, setAge] = useState('');
  const [bp, setBp] = useState('');
  const [hr, setHr] = useState('');
  const [dose, setDose] = useState('');
  
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [profileExists, setProfileExists] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      if (!address) return;
      try {
        const res = await fetch(`${API_URL}/api/profiles/${address}`);
        if (res.ok) {
          const data = await res.json();
          if (data) {
            setAge(data.age?.toString() || '');
            setBp(data.baselineBp || '');
            setHr(data.heartRate || '');
            setDose(data.currentDose || '');
            setIsVerified(data.isVerified || false);
            setProfileExists(true);
          }
        }
      } catch (e) {
        console.error("Failed to fetch profile");
      }
    }
    fetchProfile();
  }, [address]);

  const saveProfile = async () => {
    if (!isConnected || !address) return;
    setIsSaving(true);
    
    try {
      await fetch(`${API_URL}/api/profiles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress: address,
          age: parseInt(age) || 0,
          baselineBp: bp,
          heartRate: hr,
          currentDose: dose,
        })
      });
      
      setProfileExists(true);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (e) {
      console.error("Failed to save profile", e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="animate-fade-in">
      <header className="mb-8 flex flex-wrap gap-4 justify-between items-end">
        <div>
          <h2 className="mb-2">My <span className="text-gradient">Health Profile</span></h2>
          <p className="mb-0">Maintain your baseline vitals securely. These will be encrypted when you enroll in trials.</p>
        </div>
        <ConnectButton showBalance={false} />
      </header>

      <div className="grid-2 mb-8">
        <section className="glass-card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="mb-0 flex items-center gap-2">
              <User className="text-accent-secondary" /> Base Vitals
            </h3>
            {isVerified ? (
              <span className="privacy-badge"><ShieldCheck size={14}/> Verified Profile</span>
            ) : (
              <span className="privacy-badge !text-warning !border-warning bg-warning !bg-opacity-10">Unverified</span>
            )}
          </div>

          <div className="grid-2 compact mb-6">
            <div className="form-group">
              <label className="form-label flex items-center gap-1"><Activity size={14}/> Age</label>
              <input className="form-input" placeholder="e.g. 45" value={age} onChange={e => setAge(e.target.value)} disabled={isSaving} />
            </div>
            <div className="form-group">
              <label className="form-label flex items-center gap-1"><Heart size={14}/> Baseline BP</label>
              <input className="form-input" placeholder="e.g. 120/80" value={bp} onChange={e => setBp(e.target.value)} disabled={isSaving} />
            </div>
            <div className="form-group">
              <label className="form-label flex items-center gap-1"><Heart size={14}/> Heart Rate</label>
              <input className="form-input" placeholder="e.g. 72 bpm" value={hr} onChange={e => setHr(e.target.value)} disabled={isSaving} />
            </div>
            <div className="form-group">
              <label className="form-label flex items-center gap-1"><Database size={14}/> Current Dose</label>
              <input className="form-input" placeholder="e.g. 500 mg" value={dose} onChange={e => setDose(e.target.value)} disabled={isSaving} />
            </div>
          </div>

          <button className="btn-secondary" onClick={saveProfile} disabled={!isConnected || isSaving}>
            <Save size={18} /> {isSaving ? 'Saving to Database...' : isSaved ? 'Profile Saved!' : profileExists ? 'Update Profile' : 'Save Profile'}
          </button>
          {!isConnected && <p className="text-xs text-warning mt-2">Connect wallet to save profile</p>}
        </section>

        <section className="glass-card flex flex-col justify-center items-center text-center">
            <FileText size={48} className="text-text-secondary mb-4 opacity-50" />
            <h3 className="mb-2">Zero-Knowledge Storage</h3>
            <p className="text-sm text-text-secondary mb-0">
              When you enroll in a trial, your baseline vitals are fetched from this profile, converted into Fully Homomorphic Encryption (FHE) ciphertexts, and committed to the blockchain. 
            </p>
            <p className="text-sm text-text-secondary mt-2">
              Sponsors can only compute analytics on your data, but can never decrypt it.
            </p>
        </section>
      </div>
    </motion.div>
  );
}
