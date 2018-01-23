pragma solidity ^0.4.17;

contract Vendor {
  
  string public vendorname;
  address public owner; //owner of this contract

  struct part {
        uint partId; 
        string name;
        uint price;
  }

  mapping(string => part) inventory; //partName--> partObject
  mapping(string => uint) partQuantity; //partname --> part total quantity

  event shipmentStatus(address user, string itemName, uint priceToPay, address whomToPay, string message); //will be triggered when 

  modifier ownerOnly {
    if(msg.sender == owner){
      _;
    } else {
      revert();
    }
  }

  function getBalance() public ownerOnly returns (uint ownerBalance) {
    //will return owners coinbase balance
    //work in progress
    return owner.balance;
  }

  function Vendor(string vendorName) public {
    // constructor
    vendorname = vendorName;
    owner = msg.sender;
  
  }

  function addItemToInventory(uint partid, string itemName, uint price) public returns(bool) {
    part memory p;

    p.partId = partid;
    p.name = itemName; 
    p.price = price;

    inventory[itemName] = p;
    partQuantity[itemName] += 1;
    return true;
  }

  //this fn will be called from printer contract
  function deliver_parts(string name, address user) external returns (bool) {
    if(partQuantity[name] > 0) {
      //items available ship the item
      //fire the event
      uint itemPrice = inventory[name].price;  //price to pay
      //reduce the quantity of the item code to be written.
      shipmentStatus(user, name, itemPrice, owner, "item shipped"); //this event will be received by frontend
      return true;
    } else {
      //items not available
      itemPrice = 0;
      shipmentStatus(user, name, itemPrice, owner, "item not available"); //this event will be received by frontend
      return false;
    }
  }

  function getItemQuantity(string name) public returns(uint) {
    uint availableQuantity = partQuantity[name];
    return availableQuantity;
  }

  function transferOwnership(address newOwner) internal ownerOnly returns(bool){
    owner = newOwner;
  }
  
  function() payable  {
    //log an event here
  }

}

