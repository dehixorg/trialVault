import React from 'react';
import { Activity, Database, FileKey2, FlaskConical, Network } from 'lucide-react';
import { trialStatus } from '../trialData';
import { allContracts } from '../contracts';

export default function TrialStatusBar() {
  return (
    <section className="status-bar">
      <div>
        <Activity size={16} />
        <span>{trialStatus.id} | {trialStatus.phase}</span>
      </div>
      <div>
        <Database size={16} />
        <span>{trialStatus.encryptedRecords} encrypted records</span>
      </div>
      <div>
        <Network size={16} />
        <span>{trialStatus.network}</span>
      </div>
      <div>
        <FileKey2 size={16} />
        <span>{trialStatus.contractAddress}</span>
      </div>
      <div className="demo-mode-pill">
        <FlaskConical size={16} />
        <span>{allContracts.filter((contract) => contract.address !== 'pending deployment').length}/3 contracts configured</span>
      </div>
    </section>
  );
}
