pragma solidity ^0.4.17;

import "./Vendor.sol";

contract Printer3D {

  uint public printerid;
  string public printername;
  address public owner; //owner of this contract

  modifier ownerOnly {
    if(msg.sender == owner){
      _;
    } else {
      revert();
    }
  }

  function Printer3D(uint printerId, string printerName) public {
    //constructor
    printerid = printerId;
    printername = printerName;
    owner = msg.sender;
  }

  function callVendor(address vendorAddr, string partname) external returns(bool){
    address user = msg.sender;
    Vendor vendor = Vendor(vendorAddr);
    return vendor.deliver_parts(partname, user);
  }

  function getbalance() public ownerOnly view returns(uint balance) {
    return owner.balance;
  }

}

