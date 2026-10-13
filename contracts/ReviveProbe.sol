// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ReviveProbe
 * @author Gieez (Portaldot Hacker House 2026)
 * @notice Diagnostic Sentinel & Execution Verification Contract for Portaldot Network V3.0 (pallet-revive).
 * @dev Optimized for Chain ID 420420777 and native 14-decimal POT accounting.
 */
contract ReviveProbe {
    string public constant NETWORK = "Portaldot V3.0";
    uint256 public constant CHAIN_ID = 420420777;
    uint8 public constant NATIVE_DECIMALS = 14;

    struct ProbeRecord {
        uint256 probeId;
        address sender;
        uint256 timestamp;
        uint256 blockNumber;
        string tag;
        uint256 testValue; // In 14-decimal POT wei (10^14)
        bytes extraData;
    }

    uint256 public totalProbes;
    mapping(uint256 => ProbeRecord) public probeRecords;
    mapping(address => uint256[]) private userProbeIds;
    mapping(address => uint256) public diagnosticBalances;

    event ProbeExecuted(
        uint256 indexed probeId,
        address indexed sender,
        uint256 timestamp,
        uint256 blockNumber,
        string tag,
        uint256 testValue
    );

    event DiagnosticBalanceUpdated(
        address indexed account,
        uint256 newBalance,
        uint256 amountChanged,
        bool isDeposit
    );

    error InvalidProbeTag();
    error InsufficientDiagnosticBalance();

    /**
     * @notice Execute an on-chain diagnostic probe to verify block inclusion and storage state.
     * @param tag Identifier for probe category (e.g., "SENTINEL_PING", "LATENCY_VERIFY", "STATE_DIFF")
     * @param extraData Arbitrary diagnostic payload or verification proof
     */
    function recordProbe(string calldata tag, bytes calldata extraData) external payable returns (uint256) {
        if (bytes(tag).length == 0) revert InvalidProbeTag();

        uint256 currentId = ++totalProbes;

        if (msg.value > 0) {
            diagnosticBalances[msg.sender] += msg.value;
            emit DiagnosticBalanceUpdated(msg.sender, diagnosticBalances[msg.sender], msg.value, true);
        }

        ProbeRecord memory record = ProbeRecord({
            probeId: currentId,
            sender: msg.sender,
            timestamp: block.timestamp,
            blockNumber: block.number,
            tag: tag,
            testValue: msg.value,
            extraData: extraData
        });

        probeRecords[currentId] = record;
        userProbeIds[msg.sender].push(currentId);

        emit ProbeExecuted(currentId, msg.sender, block.timestamp, block.number, tag, msg.value);

        return currentId;
    }

    /**
     * @notice Withdraw deposited test POT from diagnostic balance.
     * @param amount Amount in 14-decimal POT wei
     */
    function withdrawDiagnosticBalance(uint256 amount) external {
        if (diagnosticBalances[msg.sender] < amount) revert InsufficientDiagnosticBalance();

        diagnosticBalances[msg.sender] -= amount;
        emit DiagnosticBalanceUpdated(msg.sender, diagnosticBalances[msg.sender], amount, false);

        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Withdrawal transfer failed");
    }

    /**
     * @notice Get all probe IDs initiated by an account.
     */
    function getUserProbeIds(address account) external view returns (uint256[] memory) {
        return userProbeIds[account];
    }

    /**
     * @notice Read complete probe record by ID.
     */
    function getProbeRecord(uint256 id) external view returns (ProbeRecord memory) {
        return probeRecords[id];
    }

    /**
     * @notice Compute 14-decimal POT unit conversion verification on-chain.
     * @param rawPotUnits Human units of POT
     * @return baseUnits 14-decimal base units
     */
    function to14Decimals(uint256 rawPotUnits) external pure returns (uint256 baseUnits) {
        return rawPotUnits * 10**14;
    }

    /**
     * @notice Read chain status metadata for telemetry validation.
     */
    function getChainTelemetry() external view returns (
        uint256 currentBlock,
        uint256 currentTimestamp,
        uint256 chainIdentifier,
        uint256 totalRecordedProbes
    ) {
        return (block.number, block.timestamp, block.chainid, totalProbes);
    }
}
