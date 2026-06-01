// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@fhenixprotocol/contracts/FHE.sol";
import "@fhenixprotocol/contracts/access/Permissioned.sol";

contract TrialVault is Permissioned {
    // --- MODULE 1: Encrypted Clinical Trial Participant Vault ---
    struct PatientData {
        address patient;
        string ipfsCid;
        euint8 encryptedDiagnosisCode;
        euint32 encryptedAge;
        euint32 encryptedLabValue1;
        euint32 encryptedLabValue2;
        uint128 minPriceWei;
        uint8 allowedCategories;
        bool exists;
        bool isVerified;
        address verifiedBy;
    }

    uint256 public nextTokenId = 1;
    mapping(uint256 => PatientData) internal patientRecords;
    mapping(address => uint256) public patientToTokenId;
    mapping(address => bool) public authorizedDoctors;

    event DataRegistered(address indexed patient, uint256 tokenId, string ipfsCid);
    event DoctorRegistered(address indexed doctor);
    event DataVerified(uint256 indexed tokenId, address indexed doctor);
    
    function registerData(
        string calldata ipfsCid,
        inEuint8 calldata inEncDiagnosisCode,
        inEuint32 calldata inEncAge,
        inEuint32 calldata inEncLabValue1,
        inEuint32 calldata inEncLabValue2
    ) external returns (uint256) {
        require(patientToTokenId[msg.sender] == 0, "Patient already registered");
        uint256 tokenId = nextTokenId++;

        PatientData storage data = patientRecords[tokenId];
        data.patient = msg.sender;
        data.ipfsCid = ipfsCid;
        data.encryptedDiagnosisCode = FHE.asEuint8(inEncDiagnosisCode);
        data.encryptedAge = FHE.asEuint32(inEncAge);
        data.encryptedLabValue1 = FHE.asEuint32(inEncLabValue1);
        data.encryptedLabValue2 = FHE.asEuint32(inEncLabValue2);
        data.exists = true;
        data.isVerified = false;
        data.verifiedBy = address(0);

        patientToTokenId[msg.sender] = tokenId;

        emit DataRegistered(msg.sender, tokenId, ipfsCid);
        return tokenId;
    }

    function registerAsDoctor() external {
        authorizedDoctors[msg.sender] = true;
        emit DoctorRegistered(msg.sender);
    }

    function verifyPatientData(uint256 tokenId) external {
        require(authorizedDoctors[msg.sender], "Not an authorized doctor");
        require(patientRecords[tokenId].exists, "Record does not exist");
        
        patientRecords[tokenId].isVerified = true;
        patientRecords[tokenId].verifiedBy = msg.sender;
        
        emit DataVerified(tokenId, msg.sender);
    }

    // --- MODULE 2: FHE Trial Analytics Engine ---
    struct TrialCriteria {
        string name;
        euint8 encDiagnosisRequired;
        euint32 encMinAge;
        euint32 encMaxAge;
        euint32 encLabMin;
        euint32 encLabMax;
        euint32 encRequiredScore;
        address sponsor;
    }

    uint256 public nextTrialId = 1;
    mapping(uint256 => TrialCriteria) internal trials;
    mapping(uint256 => euint32) internal trialPoolCounts;

    event TrialCreated(uint256 indexed trialId, address sponsor);

    function createTrial(
        string calldata name,
        inEuint8 calldata inEncDiagnosisRequired,
        inEuint32 calldata inEncMinAge,
        inEuint32 calldata inEncMaxAge,
        inEuint32 calldata inEncLabMin,
        inEuint32 calldata inEncLabMax,
        inEuint32 calldata inEncRequiredScore
    ) external returns (uint256) {
        uint256 trialId = nextTrialId++;
        TrialCriteria storage criteria = trials[trialId];
        criteria.name = name;
        criteria.encDiagnosisRequired = FHE.asEuint8(inEncDiagnosisRequired);
        criteria.encMinAge = FHE.asEuint32(inEncMinAge);
        criteria.encMaxAge = FHE.asEuint32(inEncMaxAge);
        criteria.encLabMin = FHE.asEuint32(inEncLabMin);
        criteria.encLabMax = FHE.asEuint32(inEncLabMax);
        criteria.encRequiredScore = FHE.asEuint32(inEncRequiredScore);
        criteria.sponsor = msg.sender;

        trialPoolCounts[trialId] = FHE.asEuint32(0);

        emit TrialCreated(trialId, msg.sender);
        return trialId;
    }

    function runMatching(uint256 trialId) external {
        TrialCriteria storage criteria = trials[trialId];
        require(criteria.sponsor != address(0), "Trial does not exist");
        
        euint32 encCount = trialPoolCounts[trialId];
        
        // Loop through all patients (in a production system, this would be batched)
        for (uint256 i = 1; i < nextTokenId; i++) {
            if (patientRecords[i].exists) {
                PatientData storage p = patientRecords[i];
                
                ebool ageOK = FHE.and(FHE.gte(p.encryptedAge, criteria.encMinAge), FHE.lte(p.encryptedAge, criteria.encMaxAge));
                ebool diagOK = FHE.eq(p.encryptedDiagnosisCode, criteria.encDiagnosisRequired);
                ebool labOK = FHE.and(FHE.gte(p.encryptedLabValue1, criteria.encLabMin), FHE.lte(p.encryptedLabValue1, criteria.encLabMax));
                
                // Calculate arithmetic match score homomorphically
                euint32 score = FHE.asEuint32(0);
                score = FHE.add(score, FHE.select(ageOK, FHE.asEuint32(5), FHE.asEuint32(0)));
                score = FHE.add(score, FHE.select(diagOK, FHE.asEuint32(10), FHE.asEuint32(0)));
                score = FHE.add(score, FHE.select(labOK, FHE.asEuint32(5), FHE.asEuint32(0)));
                
                // Add bonus points if data is verified by a doctor
                euint32 verifiedBonus = p.isVerified ? FHE.asEuint32(5) : FHE.asEuint32(0);
                score = FHE.add(score, verifiedBonus);

                // Check if score meets criteria
                ebool isEligible = FHE.gte(score, criteria.encRequiredScore);
                
                // Add 1 if eligible, 0 if not
                encCount = FHE.add(encCount, FHE.select(isEligible, FHE.asEuint32(1), FHE.asEuint32(0)));
            }
        }
        
        trialPoolCounts[trialId] = encCount;
    }

    function getPoolCount(uint256 trialId, Permission memory permission) external view onlyPermitted(permission, msg.sender) returns (uint32) {
        require(trials[trialId].sponsor == msg.sender, "Only sponsor can view pool count");
        return FHE.decrypt(trialPoolCounts[trialId]);
    }

    // --- MODULE 3: Patient-Controlled Data Access Marketplace ---
    struct License {
        uint256 datasetId;
        address licensee;
        uint256 priceWei;
        string purpose;
        bool active;
    }

    uint256 public nextLicenseId = 1;
    mapping(uint256 => License) public licenses;

    event LicenseRequested(uint256 indexed licenseId, uint256 datasetId, address licensee);
    event LicenseGranted(uint256 indexed licenseId, address patient, address pharma);

    function requestLicense(uint256 datasetId, string calldata purpose) external payable returns (uint256) {
        require(patientRecords[datasetId].exists, "Dataset does not exist");
        
        uint256 licenseId = nextLicenseId++;
        licenses[licenseId] = License({
            datasetId: datasetId,
            licensee: msg.sender,
            priceWei: msg.value,
            purpose: purpose,
            active: false
        });

        emit LicenseRequested(licenseId, datasetId, msg.sender);
        return licenseId;
    }

    function grantLicense(uint256 licenseId) external {
        License storage license = licenses[licenseId];
        require(patientRecords[license.datasetId].patient == msg.sender, "Not dataset owner");
        require(!license.active, "License already active");
        
        license.active = true;
        
        // Transfer escrowed funds to patient
        if (license.priceWei > 0) {
            payable(msg.sender).transfer(license.priceWei);
        }

        emit LicenseGranted(licenseId, msg.sender, license.licensee);
    }

    // --- MODULE 4: Cross-Site Encrypted Analysis ---
    struct HospitalTrial {
        uint8 analysisType;
        uint8 dpEpsilon;
        uint256 totalPatients;
        euint32 encryptedSum;
        bool exists;
    }

    uint256 public nextHospitalTrialId = 1;
    mapping(uint256 => HospitalTrial) public hospitalTrials;

    event HospitalTrialDeployed(uint256 indexed trialId, uint8 analysisType);
    event EncryptedCohortSubmitted(uint256 indexed trialId, uint256 count);

    function deployHospitalTrial(uint8 analysisType, uint8 dpEpsilon) external returns (uint256) {
        uint256 trialId = nextHospitalTrialId++;
        hospitalTrials[trialId] = HospitalTrial({
            analysisType: analysisType,
            dpEpsilon: dpEpsilon,
            totalPatients: 0,
            encryptedSum: FHE.asEuint32(0),
            exists: true
        });
        emit HospitalTrialDeployed(trialId, analysisType);
        return trialId;
    }

    function submitEncryptedCohort(uint256 trialId, inEuint32[] calldata inEncLabs) external {
        require(hospitalTrials[trialId].exists, "Trial does not exist");
        
        euint32 currentSum = hospitalTrials[trialId].encryptedSum;
        for (uint i = 0; i < inEncLabs.length; i++) {
            currentSum = FHE.add(currentSum, FHE.asEuint32(inEncLabs[i]));
        }
        
        hospitalTrials[trialId].encryptedSum = currentSum;
        hospitalTrials[trialId].totalPatients += inEncLabs.length;
        
        emit EncryptedCohortSubmitted(trialId, inEncLabs.length);
    }

    // --- MODULE 5: Result Integrity Layer ---
    struct ResultCommitment {
        address sponsor;
        bytes32 datasetHash;
        bytes32 merkleRoot;
        uint256 committedAt;
    }

    uint256 public nextCommitId = 1;
    mapping(uint256 => ResultCommitment) public commitments;
    mapping(uint256 => bytes32) public publishedResults;

    event ResultCommitted(uint256 indexed commitId, bytes32 datasetHash, bytes32 merkleRoot);
    event ResultsPublished(uint256 indexed trialId, bytes32 resultsHash, bool verified);

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

    function publishResults(uint256 commitId, bytes32 resultsHash) external {
        require(commitments[commitId].sponsor == msg.sender, "Not sponsor");
        publishedResults[commitId] = resultsHash;
        emit ResultsPublished(commitId, resultsHash, true);
    }

    // --- MODULE 6: Encrypted Adverse Event Reporting ---
    euint32 public encryptedTotalSeverity;
    euint32 public encryptedAlertThreshold;

    event SafetyAlert(uint256 blockNumber);

    function setAlertThreshold(inEuint32 calldata threshold) external {
        encryptedAlertThreshold = FHE.asEuint32(threshold);
        if (!FHE.isInitialized(encryptedTotalSeverity)) {
            encryptedTotalSeverity = FHE.asEuint32(0);
        }
    }

    function submitAdverseEvent(inEuint32 calldata inEncSeverity) external {
        require(FHE.isInitialized(encryptedTotalSeverity), "Threshold not set");
        encryptedTotalSeverity = FHE.add(encryptedTotalSeverity, FHE.asEuint32(inEncSeverity));
    }
}
