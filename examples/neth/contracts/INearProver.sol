pragma solidity ^0.5.0;


interface INearProver {
    function deserialize_log(bytes memory log)
        external
        view
        returns(
            bytes32 eventHash,
            bytes memory data
        );

    function verify_log(bytes memory log, bytes memory proof) external view returns(bool);
}
