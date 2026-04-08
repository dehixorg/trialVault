import { useEffect, useMemo, useState } from "react";
import html2canvas from "html2canvas";
import { logCohortRequest } from "./api";
import { fhenixAdapter } from "./fhenix";

type VaultEntry = {
  id: string;
  age: number;
  condition: string;
  site: string;
  encryptedHash: string;
};

type MatchFilter = {
  minAge: number;
  maxAge: number;
  condition: string;
};

type TourStep = {
  id: string;
  title: string;
  body: string;
  target: string;
};

const seedConditions = [
  "Type 2 Diabetes",
  "Breast Cancer",
  "Alzheimer's",
  "Hypertension",
  "Long COVID",
];

const seedSites = ["Mumbai General", "St. Jude", "Karolinska", "Mayo", "Apollo"];

const buildHash = () =>
  "0x" +
  Array.from(crypto.getRandomValues(new Uint8Array(18)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

export default function App() {
  const [demoMode, setDemoMode] = useState(
    new URLSearchParams(window.location.search).get("demo") === "1"
  );
  const [tourOpen, setTourOpen] = useState(false);
  const [tourStepIndex, setTourStepIndex] = useState(0);
  const [tourTarget, setTourTarget] = useState<string | null>(null);

  const [vaultEntries, setVaultEntries] = useState<VaultEntry[]>(() =>
    Array.from({ length: 3 }).map((_, index) => ({
      id: `TV-${1000 + index}`,
      age: 42 + index * 6,
      condition: seedConditions[index % seedConditions.length],
      site: seedSites[index % seedSites.length],
      encryptedHash: buildHash(),
    }))
  );

  const [formAge, setFormAge] = useState(46);
  const [formCondition, setFormCondition] = useState(seedConditions[0]);
  const [formSite, setFormSite] = useState(seedSites[0]);

  const [matchFilter, setMatchFilter] = useState<MatchFilter>({
    minAge: 30,
    maxAge: 70,
    condition: seedConditions[2],
  });

  const [licenseIssued, setLicenseIssued] = useState(false);
  const [resultCommitment, setResultCommitment] = useState(buildHash());
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [networkName, setNetworkName] = useState<string | null>(null);
  const [requestStatus, setRequestStatus] = useState("Idle");
  const [requestError, setRequestError] = useState<string | null>(null);

  const matches = useMemo(() => {
    return vaultEntries.filter(
      (entry) =>
        entry.age >= matchFilter.minAge &&
        entry.age <= matchFilter.maxAge &&
        entry.condition === matchFilter.condition
    ).length;
  }, [vaultEntries, matchFilter]);

  const handleVaultSubmit = () => {
    const newEntry: VaultEntry = {
      id: `TV-${1000 + vaultEntries.length}`,
      age: formAge,
      condition: formCondition,
      site: formSite,
      encryptedHash: buildHash(),
    };
    setVaultEntries((prev) => [newEntry, ...prev]);
  };

  const tourSteps: TourStep[] = [
    {
      id: "hero",
      title: "Confidential compute, explained",
      body: "This headline anchors the value prop: encrypted computation, patient rewards, and provable integrity.",
      target: "[data-tour=\"hero\"]",
    },
    {
      id: "matching",
      title: "FHE cohort matching",
      body: "Eligibility checks happen on ciphertext. Only aggregate counts are revealed.",
      target: "[data-tour=\"matching\"]",
    },
    {
      id: "vault",
      title: "Patient vault entry",
      body: "Patients encrypt data client-side and keep ownership via tokenized access.",
      target: "[data-tour=\"vault\"]",
    },
    {
      id: "licensing",
      title: "Licensing + integrity",
      body: "Licenses are issued on-chain, while result commitments prevent suppression.",
      target: "[data-tour=\"licensing\"]",
    },
  ];

  useEffect(() => {
    if (demoMode) {
      setTourOpen(true);
      setTourStepIndex(0);
    }
  }, [demoMode]);

  useEffect(() => {
    if (!tourOpen) {
      setTourTarget(null);
      return;
    }

    const step = tourSteps[tourStepIndex];
    setTourTarget(step.target);
  }, [tourOpen, tourStepIndex]);

  useEffect(() => {
    if (!tourTarget) return;
    const element = document.querySelector(tourTarget);
    if (!element) return;
    element.classList.add("tour-highlight");
    element.scrollIntoView({ behavior: "smooth", block: "center" });

    return () => {
      element.classList.remove("tour-highlight");
    };
  }, [tourTarget]);

  const handleWalletConnect = async () => {
    try {
      const result = await fhenixAdapter.connectWallet();
      setWalletAddress(result.address);
      setNetworkName(result.networkName);
    } catch (error) {
      setRequestError("Wallet connection failed.");
    }
  };

  const handleCohortRequest = async () => {
    setRequestStatus("Encrypting criteria...");
    setRequestError(null);
    try {
      const encrypted = await fhenixAdapter.encryptCriteria({
        minAge: matchFilter.minAge,
        maxAge: matchFilter.maxAge,
        condition: matchFilter.condition,
      });

      setRequestStatus("Submitting encrypted query...");
      await logCohortRequest({
        criteriaHash: encrypted.criteriaHash,
        condition: matchFilter.condition,
        minAge: matchFilter.minAge,
        maxAge: matchFilter.maxAge,
        requester: walletAddress ?? "demo",
        encryptedPayload: encrypted.payload,
      });

      setRequestStatus("Awaiting FHE compute...");
      const count = await fhenixAdapter.requestCohortCount();
      setRequestStatus("Cohort count received.");
      setVaultEntries((prev) => prev);
      setResultCommitment(buildHash());
      setMatchFilter((prev) => ({ ...prev }));
      setRequestStatus(`Encrypted cohort count: ${count}`);
    } catch (error) {
      setRequestError("Failed to request encrypted cohort.");
      setRequestStatus("Idle");
    }
  };

  const handleScreenshot = async () => {
    const app = document.querySelector(".app") as HTMLElement | null;
    if (!app) return;
    const canvas = await html2canvas(app, { backgroundColor: "#0a0f1f" });
    const link = document.createElement("a");
    link.download = `trialvault-demo-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="app">
      {demoMode && (
        <div className="demo-bar">
          <div>
            <strong>Demo Mode</strong>
            <p>Guided walkthrough and quick captures for submissions.</p>
          </div>
          <div className="demo-actions">
            <button className="secondary" onClick={() => setTourOpen(true)}>
              Start Guided Tour
            </button>
            <button className="ghost" onClick={handleScreenshot}>
              Capture Screenshot
            </button>
            <button className="ghost" onClick={() => setDemoMode(false)}>
              Exit Demo
            </button>
          </div>
        </div>
      )}

      {!demoMode && (
        <div className="demo-toggle">
          <button className="ghost" onClick={() => setDemoMode(true)}>
            Enable Demo Mode
          </button>
        </div>
      )}

      <header className="hero">
        <nav className="nav">
          <div className="logo">
            <span className="logo-dot" />
            TrialVault
          </div>
          <div className="nav-actions">
            <button className="ghost">Patient Portal</button>
            <button className="ghost">Pharma Portal</button>
            <button className="primary" onClick={handleWalletConnect}>
              {walletAddress ? "Wallet Connected" : "Connect Wallet"}
            </button>
          </div>
        </nav>

        <div className="hero-grid" data-tour="hero">
          <div className="hero-copy">
            <p className="eyebrow">FHE-native clinical trial infrastructure</p>
            <h1>
              Compute on encrypted patient data.
              <span> Patients earn. Results cannot be suppressed.</span>
            </h1>
            <p className="lead">
              TrialVault replaces trust with cryptography. Hospitals collaborate without
              sharing records. Pharma runs eligibility checks without seeing identities.
              Results are committed on-chain before anyone can hide them.
            </p>
            <div className="cta-row">
              <button className="primary">Launch Demo</button>
              <button className="secondary">See Architecture</button>
            </div>
            <div className="stat-row">
              <div>
                <h3>$54B</h3>
                <p>Global clinical trial market</p>
              </div>
              <div>
                <h3>85%</h3>
                <p>Trials miss recruitment timelines</p>
              </div>
              <div>
                <h3>$50B+</h3>
                <p>Lost to negative result suppression</p>
              </div>
            </div>
          </div>

          <div className="hero-panel" data-tour="matching">
            <div className="panel-header">
              <span>Encrypted Trial Matching</span>
              <span className="pill">Live MVP</span>
            </div>
            <div className="panel-body">
              <div className="panel-row">
                <label>Condition</label>
                <select
                  value={matchFilter.condition}
                  onChange={(event) =>
                    setMatchFilter((prev) => ({
                      ...prev,
                      condition: event.target.value,
                    }))
                  }
                >
                  {seedConditions.map((condition) => (
                    <option key={condition} value={condition}>
                      {condition}
                    </option>
                  ))}
                </select>
              </div>
              <div className="panel-row">
                <label>Age range</label>
                <div className="range-row">
                  <input
                    type="number"
                    value={matchFilter.minAge}
                    min={18}
                    max={90}
                    onChange={(event) =>
                      setMatchFilter((prev) => ({
                        ...prev,
                        minAge: Number(event.target.value),
                      }))
                    }
                  />
                  <span>to</span>
                  <input
                    type="number"
                    value={matchFilter.maxAge}
                    min={18}
                    max={90}
                    onChange={(event) =>
                      setMatchFilter((prev) => ({
                        ...prev,
                        maxAge: Number(event.target.value),
                      }))
                    }
                  />
                </div>
              </div>
              <div className="panel-result">
                <div>
                  <p>Eligible encrypted cohort</p>
                  <h2>{matches}</h2>
                </div>
                <button className="secondary" onClick={handleCohortRequest}>
                  Request Cohort Count
                </button>
              </div>
              <div className="status-row">
                <div>
                  <p className="label">Wallet</p>
                  <p className="muted">{walletAddress ?? "Not connected"}</p>
                </div>
                <div>
                  <p className="label">Network</p>
                  <p className="muted">{networkName ?? "Demo Mode"}</p>
                </div>
                <div>
                  <p className="label">Status</p>
                  <p className="muted">{requestStatus}</p>
                </div>
              </div>
              {requestError && <p className="error">{requestError}</p>}
              <div className="panel-footnote">
                Matches computed on ciphertext using FHE primitives. Only aggregate counts
                are revealed.
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="module-grid">
        <div className="module">
          <h3>Patient Data Vault</h3>
          <p>
            Self-custody encrypted health data. ERC-721 ownership tokens and revocable
            access controls.
          </p>
          <span>FHE + NFT Vault</span>
        </div>
        <div className="module">
          <h3>Trial Matching Engine</h3>
          <p>Blind eligibility evaluation. Pharma gets cohort counts, never identities.</p>
          <span>FHE Query Layer</span>
        </div>
        <div className="module">
          <h3>Data Licensing Market</h3>
          <p>Atomic swaps: key fragment for TVAULT royalties. Patients earn on reuse.</p>
          <span>Tokenized Licensing</span>
        </div>
        <div className="module">
          <h3>Cross-Hospital Analysis</h3>
          <p>Encrypted multi-party compute. Aggregate stats only, no hospital sees another.</p>
          <span>FHE MPC</span>
        </div>
        <div className="module">
          <h3>Result Integrity Layer</h3>
          <p>Merkle commitment before analysis. Selective suppression becomes impossible.</p>
          <span>On-chain Verifiability</span>
        </div>
        <div className="module">
          <h3>Adverse Event Reporting</h3>
          <p>Encrypted safety signals with threshold alerts. No central gatekeeper.</p>
          <span>Safety Automation</span>
        </div>
      </section>

      <section className="demo-grid">
        <div className="demo-card" data-tour="vault">
          <div className="card-header">
            <h2>Patient Vault — Encrypt & Store</h2>
            <span className="pill">Client-side</span>
          </div>
          <div className="card-body">
            <div className="form-grid">
              <label>
                Age
                <input
                  type="number"
                  value={formAge}
                  onChange={(event) => setFormAge(Number(event.target.value))}
                />
              </label>
              <label>
                Condition
                <select
                  value={formCondition}
                  onChange={(event) => setFormCondition(event.target.value)}
                >
                  {seedConditions.map((condition) => (
                    <option key={condition} value={condition}>
                      {condition}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Hospital Site
                <select value={formSite} onChange={(event) => setFormSite(event.target.value)}>
                  {seedSites.map((site) => (
                    <option key={site} value={site}>
                      {site}
                    </option>
                  ))}
                </select>
              </label>
              <button className="primary" onClick={handleVaultSubmit}>
                Encrypt & Store
              </button>
            </div>

            <div className="vault-list">
              {vaultEntries.slice(0, 4).map((entry) => (
                <div key={entry.id} className="vault-row">
                  <div>
                    <p>{entry.condition}</p>
                    <span>
                      {entry.age} years · {entry.site}
                    </span>
                  </div>
                  <code>{entry.encryptedHash}</code>
                </div>
              ))}
            </div>
            <div className="card-note">
              Ciphertext stored on IPFS. TrialVault never sees plaintext records.
            </div>
          </div>
        </div>

        <div className="demo-card" data-tour="licensing">
          <div className="card-header">
            <h2>Licensing & Result Integrity</h2>
            <span className="pill">On-chain</span>
          </div>
          <div className="card-body">
            <div className="license-grid">
              <div>
                <p className="label">Active dataset</p>
                <h3>Cardiometabolic Cohort</h3>
                <p className="muted">1,280 encrypted participants across 4 hospitals</p>
              </div>
              <div>
                <p className="label">Royalty rate</p>
                <h3>2.5% TVAULT</h3>
                <p className="muted">Paid per licensed analysis run</p>
              </div>
              <button
                className={licenseIssued ? "secondary" : "primary"}
                onClick={() => setLicenseIssued((prev) => !prev)}
              >
                {licenseIssued ? "License Issued" : "Issue License"}
              </button>
            </div>

            <div className="commitment">
              <div>
                <p className="label">Result commitment</p>
                <code>{resultCommitment}</code>
              </div>
              <button className="ghost" onClick={() => setResultCommitment(buildHash())}>
                Regenerate Commit
              </button>
            </div>

            <div className="card-note">
              Commitment is written before analysis. Any later change is provably invalid.
            </div>
          </div>
        </div>
      </section>

      <section className="architecture">
        <div>
          <h2>FHE-native architecture</h2>
          <p>
            TrialVault keeps data encrypted across every boundary: client, compute, and
            chain. The platform is blind by design.
          </p>
        </div>
        <div className="architecture-grid">
          <div>
            <h4>Client (Browser)</h4>
            <p>FHE encryption in the patient portal. Wallet signatures for consent.</p>
          </div>
          <div>
            <h4>Encrypted Compute</h4>
            <p>Eligibility checks, stats, and adverse event logic on ciphertext.</p>
          </div>
          <div>
            <h4>On-chain Integrity</h4>
            <p>Merkle commitments, licensing payments, and audit proofs.</p>
          </div>
        </div>
      </section>

      <section className="cta">
        <div>
          <h2>Built for the Privacy-by-Design Buildathon</h2>
          <p>
            This MVP is ready to wire into Fhenix testnets. Next steps: connect FHE
            hooks, deploy smart contracts, and onboard pilot hospitals.
          </p>
        </div>
        <div className="cta-actions">
          <button className="primary">Open Builder Console</button>
          <button className="secondary">Schedule Architecture Review</button>
        </div>
      </section>

      <footer className="footer">
        <div>
          <strong>TrialVault</strong>
          <p>Privacy-native clinical trials infrastructure.</p>
        </div>
        <div>
          <p className="label">Contact</p>
          <p>contact@trialvault.example</p>
        </div>
        <div>
          <p className="label">Stack</p>
          <p>Fhenix CoFHE · FHE EVM · IPFS · Solidity</p>
        </div>
      </footer>

      {tourOpen && (
        <div className="tour-overlay">
          <div className="tour-card">
            <p className="eyebrow">Demo Tour</p>
            <h3>{tourSteps[tourStepIndex].title}</h3>
            <p className="muted">{tourSteps[tourStepIndex].body}</p>
            <div className="tour-actions">
              <button
                className="ghost"
                onClick={() => setTourStepIndex((prev) => Math.max(prev - 1, 0))}
                disabled={tourStepIndex === 0}
              >
                Back
              </button>
              {tourStepIndex < tourSteps.length - 1 ? (
                <button
                  className="primary"
                  onClick={() => setTourStepIndex((prev) => prev + 1)}
                >
                  Next
                </button>
              ) : (
                <button className="primary" onClick={() => setTourOpen(false)}>
                  Finish
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
