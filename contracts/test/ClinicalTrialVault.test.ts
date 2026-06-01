import { expect } from "chai";
import hre from "hardhat";

const { ethers } = hre;

const protocolHash = ethers.id("TV-204 cardiovascular protocol v1");
const datasetHash = ethers.id("TV-204 encrypted dataset root");
const auditHash = ethers.id("FDA audit request TV-204");

describe("ClinicalTrialVault", function () {
  async function deployVault() {
    const [investigator, sponsor, regulator, patient, researcher] = await ethers.getSigners();
    const Vault = await ethers.getContractFactory("ClinicalTrialVault");
    const vault = await Vault.deploy();
    await vault.waitForDeployment();

    return { vault, investigator, sponsor, regulator, patient, researcher };
  }

  it("creates a clinical trial with immutable public metadata", async function () {
    const { vault, sponsor } = await deployVault();

    await expect(vault.createTrial("Trial TV-204", protocolHash, sponsor.address, 50))
      .to.emit(vault, "TrialCreated")
      .withArgs(1, "Trial TV-204", sponsor.address, protocolHash);

    const trial = await vault.trials(1);
    expect(trial.trialName).to.equal("Trial TV-204");
    expect(trial.protocolHash).to.equal(protocolHash);
    expect(trial.sponsor).to.equal(sponsor.address);
    expect(trial.enrollmentTarget).to.equal(50);
    expect(trial.actualEnrollment).to.equal(0);
    expect(trial.exists).to.equal(true);
  });

  it("rejects malformed trial creation", async function () {
    const { vault, sponsor } = await deployVault();

    await expect(vault.createTrial("", protocolHash, sponsor.address, 50)).to.be.revertedWith("Missing trial name");
    await expect(vault.createTrial("Trial TV-204", ethers.ZeroHash, sponsor.address, 50)).to.be.revertedWith("Missing protocol hash");
    await expect(vault.createTrial("Trial TV-204", protocolHash, ethers.ZeroAddress, 50)).to.be.revertedWith("Invalid sponsor");
    await expect(vault.createTrial("Trial TV-204", protocolHash, sponsor.address, 0)).to.be.revertedWith("Invalid enrollment target");
  });

  it("restricts lifecycle actions to sponsor or investigator", async function () {
    const { vault, sponsor, patient } = await deployVault();

    await vault.createTrial("Trial TV-204", protocolHash, sponsor.address, 50);

    await expect(vault.connect(patient).activateTrial(1)).to.be.revertedWith("Not trial actor");
    await expect(vault.connect(patient).completeTrial(1)).to.be.revertedWith("Not trial actor");
    await expect(vault.connect(patient).lockTrialForSubmission(1, datasetHash)).to.be.revertedWith("Not trial actor");
  });

  it("records sponsor-initiated regulator audit access", async function () {
    const { vault, sponsor, regulator } = await deployVault();

    await vault.createTrial("Trial TV-204", protocolHash, sponsor.address, 50);

    await expect(vault.connect(sponsor).initiateRegulatoryAudit(1, regulator.address, auditHash))
      .to.emit(vault, "RegulatoryAuditInitiated")
      .withArgs(1, regulator.address, auditHash);
  });

  it("exposes regulator-safe audit summaries without PII", async function () {
    const { vault, sponsor } = await deployVault();

    await vault.createTrial("Trial TV-204", protocolHash, sponsor.address, 50);
    const summary = await vault.getAuditSummary(1);

    expect(summary.trialId).to.equal(1);
    expect(summary.enrolledPatients).to.equal(0);
    expect(summary.protocolHash).to.equal(protocolHash);
    expect(summary.piiDisclosed).to.equal(false);
  });

  it("keeps the encrypted API surface available for CoFHE integration", async function () {
    const { vault } = await deployVault();
    const fragments = vault.interface.fragments.map((fragment) => fragment.format());

    expect(fragments.some((fragment) => fragment.includes("enrollPatient(uint256,bytes32,(bytes,int32),(bytes,int32),(bytes,int32),(bytes,int32))"))).to.equal(true);
    expect(fragments.some((fragment) => fragment.includes("recordOutcome(uint256,uint256,(bytes,int32),(bytes,int32),(bytes,int32))"))).to.equal(true);
    expect(fragments.some((fragment) => fragment.includes("computeAggregateStatistics(uint256)"))).to.equal(true);
    expect(fragments.some((fragment) => fragment.includes("sealPatientOutcomeForSelf(uint256,uint256,bytes32)"))).to.equal(true);
  });
});
