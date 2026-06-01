// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@fhenixprotocol/contracts/FHE.sol";
import "@fhenixprotocol/contracts/access/Permissioned.sol";

contract PatientVault is Permissioned {
    struct PatientData {
        address patient;
        string ipfsCid;
        euint8 encryptedDiagnosisCode;
        euint32 encryptedAge;
        euint32 encryptedLabValue1;
        euint32 encryptedLabValue2;
        uint128 minPriceWei;
        uint8 allowedCategories;
        bytes2 geoWhitelist;
        bool exists;
    }

    uint256 public nextTokenId = 1;
    mapping(uint256 => PatientData) internal patientRecords;
    mapping(uint256 => mapping(address => bool)) public accessRevoked;
    mapping(address => uint256) public patientToTokenId;
    
    event DataRegistered(address indexed patient, uint256 tokenId, string ipfsCid);
    event AccessRevoked(uint256 indexed tokenId, address indexed licensee);
    event LicensingTermsUpdated(uint256 indexed tokenId, uint128 minPriceWei);

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

        patientToTokenId[msg.sender] = tokenId;

        emit DataRegistered(msg.sender, tokenId, ipfsCid);
        return tokenId;
    }

    function updateLicensingTerms(
        uint256 tokenId,
        uint128 minPriceWei,
        uint8 allowedCategories,
        bytes2 geoWhitelist
    ) external {
        require(patientRecords[tokenId].patient == msg.sender, "Not the owner");
        patientRecords[tokenId].minPriceWei = minPriceWei;
        patientRecords[tokenId].allowedCategories = allowedCategories;
        patientRecords[tokenId].geoWhitelist = geoWhitelist;

        emit LicensingTermsUpdated(tokenId, minPriceWei);
    }

    function revokeAccess(uint256 tokenId, address licensee) external {
        require(patientRecords[tokenId].patient == msg.sender, "Not the owner");
        accessRevoked[tokenId][licensee] = true;
        emit AccessRevoked(tokenId, licensee);
    }

    function getPatientData(uint256 tokenId)
        internal
        view
        returns (PatientData storage)
    {
        require(patientRecords[tokenId].exists, "Patient does not exist");
        return patientRecords[tokenId];
    }
}
