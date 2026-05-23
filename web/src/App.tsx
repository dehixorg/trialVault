import React from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { Shield, Activity, Database, Lock, Search, Eye } from 'lucide-react';
import PatientDashboard from './pages/PatientDashboard';
import PharmaDashboard from './pages/PharmaDashboard';
import RegulatorDashboard from './pages/RegulatorDashboard';

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        {/* Sidebar */}
        <aside className="sidebar">
          <div>
            <div className="flex items-center gap-2 mb-8">
              <Shield className="text-accent-primary" size={32} />
              <h1 style={{ fontSize: '1.5rem', marginBottom: 0 }}>
                Trial<span className="text-gradient">Vault</span>
              </h1>
            </div>
            
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <NavLink 
                to="/" 
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                <Activity size={20} />
                Patient Vault
              </NavLink>
              
              <NavLink 
                to="/pharma" 
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                <Search size={20} />
                Trial Matching
              </NavLink>

              <NavLink 
                to="/regulator" 
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                <Eye size={20} />
                Regulator Oversight
              </NavLink>
              
              <div className="mt-8 mb-4">
                <span className="form-label" style={{ paddingLeft: '1rem' }}>NETWORK</span>
              </div>
              
              <div className="nav-link" style={{ opacity: 0.5, cursor: 'not-allowed' }}>
                <Database size={20} />
                Licensing Market
              </div>
              <div className="nav-link" style={{ opacity: 0.5, cursor: 'not-allowed' }}>
                <Lock size={20} />
                Integrity Layer
              </div>
            </nav>
          </div>
          
          <div style={{ marginTop: 'auto' }}>
            <div className="glass-card" style={{ padding: '1rem' }}>
              <div className="flex items-center gap-2 mb-2">
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)' }}></div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Fhenix Testnet</span>
              </div>
              <p style={{ fontSize: '0.75rem', marginBottom: 0, color: 'var(--text-secondary)' }}>
                FHE-Native Privacy Enabled
              </p>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="main-content">
          <Routes>
            <Route path="/" element={<PatientDashboard />} />
            <Route path="/pharma" element={<PharmaDashboard />} />
            <Route path="/regulator" element={<RegulatorDashboard />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
