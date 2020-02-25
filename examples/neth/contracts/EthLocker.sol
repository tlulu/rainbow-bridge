pragma solidity ^0.5.0;

import "./INearProver.sol";


contract EthLocker {

    INearProver public nearProver = INearProver(0);
    bytes32 public NETH_WITHDRAW_EVENT_HASH = 0x0;

    event Locked(
        string nearAccount,
        uint256 value
    );

    event Unlocked(
        address ethAccount,
        uint256 value
    );

    function deposit(string nearAccount) external payable {
        emit Locked(nearAccount, value);
    }

    function withdraw(bytes memory log, bytes memory proof) external {
        // Verify eventHash and log proof
        (bytes32 eventHash, bytes memory data) = nearProver.deserialize_log(log);
        require(eventHash == NETH_WITHDRAW_EVENT_HASH, "EthLocker: Invalid event");
        require(nearProver.verify_log(log, proof), "EthLocker: Proof is invalid");

        // Deserialize log arguments and withdraw
        (address ethAccount, uint256 value) = abi.decode(data, (address,uint256));
        ethAccount.transfer(value);
        emit Unlocked(ethAccount, value);
    }
}
