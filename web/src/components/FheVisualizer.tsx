import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Cpu, Database, CheckCircle } from 'lucide-react';

export default function FheVisualizer({ onComplete }: { onComplete: () => void }) {
  // Sequence: 
  // 1. Initial State (analytics request)
  // 2. Encryption (ciphertext records)
  // 3. Network Compute (Homomorphic operations)
  // 4. Result (Aggregated value)

  React.useEffect(() => {
    const timer = setTimeout(onComplete, 5000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="glass-card mb-8 overflow-hidden relative">
      <div className="absolute inset-0 bg-accent-glow opacity-5 blur-3xl rounded-full mix-blend-screen" />
      
      <h3 className="mb-6 flex items-center gap-2">
        <Cpu className="text-accent-primary" />
        FHE Clinical Analytics
      </h3>

      <div className="flex items-center justify-between px-8 py-4 relative">
        {/* Step 1: Encrypting Query */}
        <div className="flex flex-col items-center z-10">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-16 h-16 rounded-full bg-bg-tertiary border border-border-color flex items-center justify-center mb-4"
          >
            <Lock className="text-text-secondary" />
          </motion.div>
          <span className="text-xs font-mono text-text-secondary text-center">Load Encrypted<br/>Records</span>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 1, delay: 0.5 }}
            className="h-1 bg-accent-primary absolute top-12 left-16"
            style={{ zIndex: -1, width: '120px' }}
          />
        </div>

        {/* Step 2: Homomorphic Compute */}
        <div className="flex flex-col items-center z-10">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: [1, 1.1, 1], opacity: 1 }}
            transition={{ delay: 1.5, duration: 2, repeat: Infinity }}
            className="w-20 h-20 rounded-xl bg-accent-primary bg-opacity-20 border border-accent-primary flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(139,92,246,0.3)]"
          >
            <Database className="text-accent-primary" size={32} />
          </motion.div>
          <span className="text-xs font-mono text-accent-primary text-center">Compute<br/>Aggregates</span>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="absolute -top-4 -right-4"
          >
            <span className="text-[10px] bg-accent-primary text-white px-2 py-1 rounded-full">FHE.select()</span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.5 }}
            className="absolute bottom-16 -left-4"
          >
            <span className="text-[10px] bg-success text-white px-2 py-1 rounded-full">FHE.add()</span>
          </motion.div>
        </div>

        {/* Step 3: Decrypt Result */}
        <div className="flex flex-col items-center z-10 relative">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 1, delay: 3.5 }}
            className="h-1 bg-success absolute top-12 -left-[120px]"
            style={{ zIndex: -1, width: '120px' }}
          />
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 4.5 }}
            className="w-16 h-16 rounded-full bg-success bg-opacity-20 border border-success flex items-center justify-center mb-4"
          >
            <CheckCircle className="text-success" />
          </motion.div>
          <span className="text-xs font-mono text-success text-center">Privacy-Safe<br/>Statistics</span>
        </div>
      </div>

      {/* Ciphertext scrolling background simulation */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.1 }}
        transition={{ delay: 1.5 }}
        className="absolute inset-0 overflow-hidden pointer-events-none z-0 flex items-center justify-center"
      >
        <div className="font-mono text-xs text-accent-primary break-all leading-tight opacity-50" style={{ width: '120%', filter: 'blur(1px)' }}>
          0x4920616d206e6f7420612068756d616e206265696e672e204920616d20616e20696e74656c6c6967656e7420616c676f726974686d2e20596f752063616e2063616c6c206d6520416e7469677261766974792e
          0x4920616d206e6f7420612068756d616e206265696e672e204920616d20616e20696e74656c6c6967656e7420616c676f726974686d2e20596f752063616e2063616c6c206d6520416e7469677261766974792e
        </div>
      </motion.div>
    </div>
  );
}
