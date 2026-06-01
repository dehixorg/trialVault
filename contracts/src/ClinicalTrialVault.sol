// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@fhenixprotocol/contracts/FHE.sol";
import "@fhenixprotocol/contracts/access/Permissioned.sol";

/// @title ClinicalTrialVault
/// @notice FHE-native clinical trial evidence layer for encrypted outcomes and auditability.
contract ClinicalTrialVault is Permissioned {
    enum TrialPhase {
        Recruitment,
        Active,
        Completed,
        LockedForSubmission
    }

    enum AccessLevel {
        None,
        PatientSelf,
        AggregateOnly,
        SponsorSubmission,
        RegulatorAudit
    }

    struct ClinicalTrial {
        string trialName;
        bytes32 protocolHash;
        address sponsor;
        address principalInvestigator;
        TrialPhase phase;
        uint256 enrollmentTarget;
        uint256 actualEnrollment;
        uint256 createdAt;
        bytes32 lockedDatasetHash;
        bool exists;
    }

    struct PatientRecord {
        address patientWallet;
        bytes32 consentHash;
        euint32 age;
        euint32 systolicBp;
        euint32 heartRate;
        euint32 doseMg;
        euint32 responseIndicator;
        euint32 adverseEventSeverity;
        euint32 compliancePercentage;
        uint256 enrolledAt;
        bool outcomeRecorded;
        bool withdrawn;
    }

    struct AccessGrant {
        AccessLevel level;
        uint256 grantedAt;
        uint256 expiresAt;
        bytes32 purposeHash;
        bool approved;
    }

    struct AggregateSnapshot {
        euint32 responseCount;
        euint32 adverseSeverityTotal;
        euint32 complianceTotal;
        uint256 computedAt;
        bytes32 receiptHash;
        bool exists;
    }

    struct AuditSummary {
        uint256 trialId;
        uint256 enrolledPatients;
        TrialPhase phase;
        bytes32 protocolHash;
        bytes32 lockedDatasetHash;
        bytes32 latestAggregateReceipt;
        bool piiDisclosed;
    }

    uint256 public nextTrialId = 1;

    mapping(uint256 => ClinicalTrial) public trials;
    mapping(uint256 => mapping(uint256 => PatientRecord)) internal patientRecords;
    mapping(uint256 => mapping(address => AccessGrant[])) internal accessGrants;
    mapping(uint256 => AggregateSnapshot) internal aggregateSnapshots;

    event TrialCreated(uint256 indexed trialId, string trialName, address indexed sponsor, bytes32 protocolHash);
    event PatientEnrolled(uint256 indexed trialId, uint256 indexed patientId, address indexed patientWallet, bytes32 consentHash);
    event OutcomeRecorded(uint256 indexed trialId, uint256 indexed patientId, address indexed investigator);
    event AggregateComputed(uint256 indexed trialId, bytes32 receiptHash, uint256 patientCount);
    event AccessGranted(
        uint256 indexed trialId,
        uint256 indexed patientId,
        address indexed grantee,
        AccessLevel accessLevel,
        uint256 expiresAt,
        bytes32 purposeHash
    );
    event TrialLockedForSubmission(uint256 indexed trialId, bytes32 datasetHash);
    event RegulatoryAuditInitiated(uint256 indexed trialId, address indexed regulator, bytes32 auditRequestHash);

    modifier onlyTrialActor(uint256 trialId) {
        ClinicalTrial storage trial = trials[trialId];
        require(trial.exists, "Trial does not exist");
        require(
            msg.sender == trial.sponsor || msg.sender == trial.principalInvestigator,
            "Not trial actor"
        );
        _;
    }

    function createTrial(
        string calldata trialName,
        bytes32 protocolHash,
        address sponsor,
        uint256 enrollmentTarget
    ) external returns (uint256) {
        require(bytes(trialName).length > 0, "Missing trial name");
        require(protocolHash != bytes32(0), "Missing protocol hash");
        require(sponsor != address(0), "Invalid sponsor");
        require(enrollmentTarget > 0, "Invalid enrollment target");

        uint256 trialId = nextTrialId++;
        trials[trialId] = ClinicalTrial({
            trialName: trialName,
            protocolHash: protocolHash,
            sponsor: sponsor,
            principalInvestigator: msg.sender,
            phase: TrialPhase.Recruitment,
            enrollmentTarget: enrollmentTarget,
            actualEnrollment: 0,
            createdAt: block.timestamp,
            lockedDatasetHash: bytes32(0),
            exists: true
        });

        emit TrialCreated(trialId, trialName, sponsor, protocolHash);
        return trialId;
    }

    function enrollPatient(
        uint256 trialId,
        bytes32 consentHash,
        inEuint32 calldata encryptedAge,
        inEuint32 calldata encryptedSystolicBp,
        inEuint32 calldata encryptedHeartRate,
        inEuint32 calldata encryptedDoseMg
    ) external returns (uint256) {
        ClinicalTrial storage trial = trials[trialId];
        require(trial.exists, "Trial does not exist");
        require(trial.phase == TrialPhase.Recruitment, "Enrollment closed");
        require(trial.actualEnrollment < trial.enrollmentTarget, "Trial full");
        require(consentHash != bytes32(0), "Missing consent hash");

        uint256 patientId = trial.actualEnrollment++;
        PatientRecord storage record = patientRecords[trialId][patientId];
        record.patientWallet = msg.sender;
        record.consentHash = consentHash;
        record.age = FHE.asEuint32(encryptedAge);
        record.systolicBp = FHE.asEuint32(encryptedSystolicBp);
        record.heartRate = FHE.asEuint32(encryptedHeartRate);
        record.doseMg = FHE.asEuint32(encryptedDoseMg);
        record.enrolledAt = block.timestamp;

        emit PatientEnrolled(trialId, patientId, msg.sender, consentHash);
        return patientId;
    }

    function activateTrial(uint256 trialId) external onlyTrialActor(trialId) {
        ClinicalTrial storage trial = trials[trialId];
        require(trial.phase == TrialPhase.Recruitment, "Invalid phase");
        require(trial.actualEnrollment > 0, "No patients enrolled");
        trial.phase = TrialPhase.Active;
    }

    function recordOutcome(
        uint256 trialId,
        uint256 patientId,
        inEuint32 calldata encryptedResponseIndicator,
        inEuint32 calldata encryptedAdverseSeverity,
        inEuint32 calldata encryptedCompliancePercentage
    ) external onlyTrialActor(trialId) {
        ClinicalTrial storage trial = trials[trialId];
        require(trial.phase == TrialPhase.Active, "Trial not active");
        require(patientId < trial.actualEnrollment, "Invalid patient");

        PatientRecord storage record = patientRecords[trialId][patientId];
        require(!record.withdrawn, "Patient withdrawn");

        record.responseIndicator = FHE.asEuint32(encryptedResponseIndicator);
        record.adverseEventSeverity = FHE.asEuint32(encryptedAdverseSeverity);
        record.compliancePercentage = FHE.asEuint32(encryptedCompliancePercentage);
        record.outcomeRecorded = true;

        emit OutcomeRecorded(trialId, patientId, msg.sender);
    }

    function computeAggregateStatistics(uint256 trialId) external onlyTrialActor(trialId) returns (bytes32) {
        ClinicalTrial storage trial = trials[trialId];
        require(trial.actualEnrollment > 0, "No patients enrolled");

        euint32 responseCount = FHE.asEuint32(0);
        euint32 severityTotal = FHE.asEuint32(0);
        euint32 complianceTotal = FHE.asEuint32(0);
        uint256 outcomeCount = 0;

        for (uint256 i = 0; i < trial.actualEnrollment; i++) {
            PatientRecord storage record = patientRecords[trialId][i];
            if (record.outcomeRecorded && !record.withdrawn) {
                responseCount = FHE.add(responseCount, record.responseIndicator);
                severityTotal = FHE.add(severityTotal, record.adverseEventSeverity);
                complianceTotal = FHE.add(complianceTotal, record.compliancePercentage);
                outcomeCount++;
            }
        }

        require(outcomeCount > 0, "No outcomes recorded");

        bytes32 receiptHash = keccak256(
            abi.encode(trialId, outcomeCount, block.number, msg.sender, trial.protocolHash)
        );

        aggregateSnapshots[trialId] = AggregateSnapshot({
            responseCount: responseCount,
            adverseSeverityTotal: severityTotal,
            complianceTotal: complianceTotal,
            computedAt: block.timestamp,
            receiptHash: receiptHash,
            exists: true
        });

        emit AggregateComputed(trialId, receiptHash, outcomeCount);
        return receiptHash;
    }

    function completeTrial(uint256 trialId) external onlyTrialActor(trialId) {
        ClinicalTrial storage trial = trials[trialId];
        require(trial.phase == TrialPhase.Active, "Invalid phase");
        trial.phase = TrialPhase.Completed;
    }

    function grantDataAccess(
        uint256 trialId,
        uint256 patientId,
        address grantee,
        AccessLevel accessLevel,
        uint256 durationDays,
        bytes32 purposeHash
    ) external {
        ClinicalTrial storage trial = trials[trialId];
        require(trial.exists, "Trial does not exist");
        require(patientId < trial.actualEnrollment, "Invalid patient");
        require(grantee != address(0), "Invalid grantee");
        require(accessLevel != AccessLevel.None, "Invalid access level");

        PatientRecord storage record = patientRecords[trialId][patientId];
        require(msg.sender == record.patientWallet, "Only patient can grant");
        require(durationDays > 0 && durationDays <= 365, "Invalid duration");

        uint256 expiresAt = block.timestamp + durationDays * 1 days;
        accessGrants[trialId][grantee].push(AccessGrant({
            level: accessLevel,
            grantedAt: block.timestamp,
            expiresAt: expiresAt,
            purposeHash: purposeHash,
            approved: true
        }));

        emit AccessGranted(trialId, patientId, grantee, accessLevel, expiresAt, purposeHash);
    }

    function lockTrialForSubmission(uint256 trialId, bytes32 datasetHash) external onlyTrialActor(trialId) {
        ClinicalTrial storage trial = trials[trialId];
        require(trial.phase == TrialPhase.Completed, "Trial not completed");
        require(datasetHash != bytes32(0), "Missing dataset hash");
        require(aggregateSnapshots[trialId].exists, "Missing aggregate receipt");

        trial.lockedDatasetHash = datasetHash;
        trial.phase = TrialPhase.LockedForSubmission;

        emit TrialLockedForSubmission(trialId, datasetHash);
    }

    function initiateRegulatoryAudit(
        uint256 trialId,
        address regulator,
        bytes32 auditRequestHash
    ) external {
        ClinicalTrial storage trial = trials[trialId];
        require(trial.exists, "Trial does not exist");
        require(msg.sender == trial.sponsor, "Only sponsor");
        require(regulator != address(0), "Invalid regulator");

        accessGrants[trialId][regulator].push(AccessGrant({
            level: AccessLevel.RegulatorAudit,
            grantedAt: block.timestamp,
            expiresAt: block.timestamp + 30 days,
            purposeHash: auditRequestHash,
            approved: true
        }));

        emit RegulatoryAuditInitiated(trialId, regulator, auditRequestHash);
    }

    function getAuditSummary(uint256 trialId) external view returns (AuditSummary memory) {
        ClinicalTrial storage trial = trials[trialId];
        require(trial.exists, "Trial does not exist");

        return AuditSummary({
            trialId: trialId,
            enrolledPatients: trial.actualEnrollment,
            phase: trial.phase,
            protocolHash: trial.protocolHash,
            lockedDatasetHash: trial.lockedDatasetHash,
            latestAggregateReceipt: aggregateSnapshots[trialId].receiptHash,
            piiDisclosed: false
        });
    }

    function getAggregateReceipt(uint256 trialId) external view returns (
        bytes32 receiptHash,
        uint256 computedAt,
        bool exists
    ) {
        AggregateSnapshot storage snapshot = aggregateSnapshots[trialId];
        return (snapshot.receiptHash, snapshot.computedAt, snapshot.exists);
    }

    function getPatientRecordMetadata(uint256 trialId, uint256 patientId) external view returns (
        address patientWallet,
        bytes32 consentHash,
        uint256 enrolledAt,
        bool outcomeRecorded,
        bool withdrawn
    ) {
        ClinicalTrial storage trial = trials[trialId];
        require(trial.exists, "Trial does not exist");
        require(patientId < trial.actualEnrollment, "Invalid patient");
        PatientRecord storage record = patientRecords[trialId][patientId];
        return (record.patientWallet, record.consentHash, record.enrolledAt, record.outcomeRecorded, record.withdrawn);
    }

    function sealPatientOutcomeForSelf(
        uint256 trialId,
        uint256 patientId,
        bytes32 publicKey
    ) external view returns (
        string memory sealedResponseIndicator,
        string memory sealedAdverseSeverity,
        string memory sealedCompliancePercentage
    ) {
        ClinicalTrial storage trial = trials[trialId];
        require(trial.exists, "Trial does not exist");
        require(patientId < trial.actualEnrollment, "Invalid patient");

        PatientRecord storage record = patientRecords[trialId][patientId];
        require(msg.sender == record.patientWallet, "Only patient");
        require(record.outcomeRecorded, "Outcome not recorded");

        return (
            record.responseIndicator.seal(publicKey),
            record.adverseEventSeverity.seal(publicKey),
            record.compliancePercentage.seal(publicKey)
        );
    }
}
