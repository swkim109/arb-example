//SPDX-License-Identifier:MIT
pragma solidity ^0.8.0;

import "./interface/ArbSys.sol";

contract SimpleStorageL2 {

    ArbSys constant arbSys = ArbSys(0x0000000000000000000000000000000000000064);

    address simpleStorageL1;
    uint256 storedData = 100;

    event Change(string message, uint newVal);

    constructor (address _addr) {
        simpleStorageL1 = _addr;
    }

    function set(uint256 x) public {
        require(x < 50000, "Should be less than 50000");
        storedData = x;
        emit Change("set", x);
    }

    function get() public view returns (uint) {
        return storedData;
    }

    function sendTxToL1() external payable returns (uint256) {
        bytes memory data = abi.encodeWithSignature("set(uint256)", storedData);
        return arbSys.sendTxToL1(simpleStorageL1, data);
    }

}
