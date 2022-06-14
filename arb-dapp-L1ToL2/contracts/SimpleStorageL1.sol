//SPDX-License-Identifier:MIT
pragma solidity ^0.8.0;

import "./interface/IInbox.sol";

contract SimpleStorageL1 {

    // Rinkeby delayed inbox
    IInbox constant inbox = IInbox(0x578BAde599406A8fE3d24Fd7f7211c0911F5B29e);

    address simpleStorageL2;
    uint256 storedData = 100;

    event Change(string message, uint newVal);
    event RetryableTicketCreated(uint256 indexed msgNo);

    constructor (address _addr) {
        simpleStorageL2 = _addr;
    }

    function set(uint x) public {
        require(x < 50000, "Should be less than 50000");
        storedData = x;
        emit Change("set", x);
    }

    function get() public view returns (uint) {
        return storedData;
    }

    function sendTxToL2(
        uint256 _storedData,
        uint256 maxSubmissionCost,
        uint256 maxGas,
        uint256 gasPriceBid
    ) public payable returns (uint256) {

        bytes memory data = abi.encodeWithSignature("set(uint256)", _storedData);

        uint256 msgNo = inbox.createRetryableTicket{ value: msg.value }(
            simpleStorageL2,
            0,
            maxSubmissionCost, // base submission fee
            msg.sender, // fee refund
            msg.sender, // call value refund
            maxGas,
            gasPriceBid,
            data
        );

        emit RetryableTicketCreated(msgNo);
        return msgNo;
    }

}
