// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title TrialVaultMVP
/// @notice MVP smart contract scaffolding for the TrialVault platform.
/// @dev This contract intentionally keeps logic minimal until FHE + CoFHE types are wired in.
contract TrialVaultMVP {
    struct PatientRecord {
        address owner;
        bytes32 dataHash; // Encrypted payload hash (IPFS CID hash or similar)
        bytes32 metadataHash; // Encrypted metadata pointer
        bool consentActive;
    }

    struct CohortRequest {
        address requester;
        bytes32 criteriaHash; // Hash of FHE-encrypted criteria
        bool fulfilled;
        uint256 cohortCount;
        bytes32 fheProofHash; // Placeholder for FHE compute proof
    }

    struct LicenseGrant {
        address patient;
        address licensee;
        uint256 royaltyBps;
        bytes32 keyFragmentHash;
        bool active;
    }

    struct ResultCommitment {
        address sponsor;
        bytes32 datasetHash;
        bytes32 merkleRoot;
        uint256 committedAt;
    }

    address public owner;
    address public computeOperator;

    uint256 public nextPatientId = 1;
    uint256 public nextRequestId = 1;
    uint256 public nextLicenseId = 1;
    uint256 public nextCommitId = 1;

    mapping(uint256 => PatientRecord) public patients;
    mapping(uint256 => CohortRequest) public cohortRequests;
    mapping(uint256 => LicenseGrant) public licenses;
    mapping(uint256 => ResultCommitment) public commitments;

    event PatientRegistered(uint256 indexed patientId, address indexed owner, bytes32 dataHash);
    event ConsentUpdated(uint256 indexed patientId, bool consentActive);
    event CohortRequested(uint256 indexed requestId, address indexed requester, bytes32 criteriaHash);
    event CohortFulfilled(uint256 indexed requestId, uint256 cohortCount, bytes32 fheProofHash);
    event LicenseIssued(uint256 indexed licenseId, address indexed patient, address indexed licensee);
    event LicenseRevoked(uint256 indexed licenseId);
    event ResultCommitted(uint256 indexed commitId, bytes32 datasetHash, bytes32 merkleRoot);
    event AdverseEventSignal(bytes32 indexed cohortHash, uint256 signalCount, uint256 threshold);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier onlyComputeOperator() {
        require(msg.sender == computeOperator, "Not compute operator");
        _;
    }

    constructor(address _computeOperator) {
        owner = msg.sender;
        computeOperator = _computeOperator;
    }

    function setComputeOperator(address _computeOperator) external onlyOwner {
        computeOperator = _computeOperator;
    }

    /// @notice Registers an encrypted patient dataset and grants ownership to the caller.
    function registerPatient(bytes32 dataHash, bytes32 metadataHash) external returns (uint256) {
        uint256 patientId = nextPatientId++;
        patients[patientId] = PatientRecord({
            owner: msg.sender,
            dataHash: dataHash,
            metadataHash: metadataHash,
            consentActive: true
        });

        emit PatientRegistered(patientId, msg.sender, dataHash);
        return patientId;
    }

    function updateConsent(uint256 patientId, bool consentActive) external {
        PatientRecord storage record = patients[patientId];
        require(record.owner == msg.sender, "Not patient owner");
        record.consentActive = consentActive;
        emit ConsentUpdated(patientId, consentActive);
    }

    /// @notice Submit an encrypted cohort request. FHE evaluation happens off-chain for MVP.
    function requestCohort(bytes32 criteriaHash) external returns (uint256) {
        uint256 requestId = nextRequestId++;
        cohortRequests[requestId] = CohortRequest({
            requester: msg.sender,
            criteriaHash: criteriaHash,
            fulfilled: false,
            cohortCount: 0,
            fheProofHash: bytes32(0)
        });

        emit CohortRequested(requestId, msg.sender, criteriaHash);
        return requestId;
    }

    /// @notice Fulfill cohort request with encrypted compute result (placeholder).
    function fulfillCohortRequest(
        uint256 requestId,
        uint256 cohortCount,
        bytes32 fheProofHash
    ) external onlyComputeOperator {
        CohortRequest storage request = cohortRequests[requestId];
        require(!request.fulfilled, "Already fulfilled");
        request.fulfilled = true;
        request.cohortCount = cohortCount;
        request.fheProofHash = fheProofHash;

        emit CohortFulfilled(requestId, cohortCount, fheProofHash);
    }

    /// @notice Issue a data license to a pharma partner.
    function issueLicense(
        uint256 patientId,
        address licensee,
        uint256 royaltyBps,
        bytes32 keyFragmentHash
    ) external returns (uint256) {
        PatientRecord storage record = patients[patientId];
        require(record.owner == msg.sender, "Not patient owner");
        require(record.consentActive, "Consent revoked");

        uint256 licenseId = nextLicenseId++;
        licenses[licenseId] = LicenseGrant({
            patient: msg.sender,
            licensee: licensee,
            royaltyBps: royaltyBps,
            keyFragmentHash: keyFragmentHash,
            active: true
        });

        emit LicenseIssued(licenseId, msg.sender, licensee);
        return licenseId;
    }

    function revokeLicense(uint256 licenseId) external {
        LicenseGrant storage grant = licenses[licenseId];
        require(grant.patient == msg.sender, "Not patient owner");
        grant.active = false;
        emit LicenseRevoked(licenseId);
    }

    /// @notice Commit trial results before analysis is revealed.
    function commitResults(bytes32 datasetHash, bytes32 merkleRoot) external returns (uint256) {
        uint256 commitId = nextCommitId++;
        commitments[commitId] = ResultCommitment({
            sponsor: msg.sender,
            datasetHash: datasetHash,
            merkleRoot: merkleRoot,
            committedAt: block.timestamp
        });

        emit ResultCommitted(commitId, datasetHash, merkleRoot);
        return commitId;
    }

    /// @notice Emit adverse event alert when encrypted signal crosses threshold.
    function reportAdverseEvent(bytes32 cohortHash, uint256 signalCount, uint256 threshold)
        external
        onlyComputeOperator
    {
        require(signalCount >= threshold, "Threshold not met");
        emit AdverseEventSignal(cohortHash, signalCount, threshold);
    }
}
